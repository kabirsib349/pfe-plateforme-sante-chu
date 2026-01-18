package com.pfe.backend.service;

import com.pfe.backend.model.PasswordReset;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.PasswordResetRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PasswordResetRepository passwordResetRepository;
    @Mock
    private UtilisateurRepository utilisateurRepository;
    @Mock
    private MailService mailService;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private Utilisateur utilisateur;

    @BeforeEach
    void setUp() {
        utilisateur = new Utilisateur();
        utilisateur.setId(1L);
        utilisateur.setEmail("test@test.com");
        
        // Inject values for @Value fields
        ReflectionTestUtils.setField(passwordResetService, "otpExpiryMinutes", 10);
        ReflectionTestUtils.setField(passwordResetService, "resetTokenExpiryMinutes", 15);
    }

    @Test
    void forgotPassword_ShouldDoNothing_WhenUserNotFound() {
        when(utilisateurRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        passwordResetService.forgotPassword("unknown@test.com");

        verify(passwordResetRepository, never()).save(any(PasswordReset.class));
        verify(mailService, never()).sendVerificationCodeEmail(anyString(), anyString(), anyInt());
    }

    @Test
    void forgotPassword_ShouldInitiateReset_WhenUserExists() {
        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(utilisateur));
        when(passwordResetRepository.findByUserIdAndUsedAtIsNull(1L)).thenReturn(Optional.empty());

        passwordResetService.forgotPassword("test@test.com");

        verify(passwordResetRepository).save(any(PasswordReset.class));
        verify(mailService).sendVerificationCodeEmail(eq("test@test.com"), anyString(), eq(10));
    }

    @Test
    void verifyResetCode_ShouldThrowException_WhenInvalidCode() {
        PasswordReset reset = new PasswordReset();
        reset.setOtpHash("encodedCode");
        reset.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        reset.setAttempts(0);

        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(utilisateur));
        when(passwordResetRepository.findByUserIdAndUsedAtIsNull(1L)).thenReturn(Optional.of(reset));
        // Simulate invalid code check (mocking static BCrypt usage is hard with Mockito, assumes direct dependency or valid hash check fail)
        // Since the service uses BCrypt directly, we can't easily mock it without PowerMock.
        // However, we can rely on standard behavior or mock PasswordEncoder if it was used.
        // Since we cannot mock static BCrypt easily, we use a real hash that won't match "wrong"
        String realHash = BCrypt.hashpw("123456", BCrypt.gensalt());
        reset.setOtpHash(realHash);
        
        when(passwordResetRepository.save(any(PasswordReset.class))).thenReturn(reset);

        assertThrows(IllegalArgumentException.class, () -> passwordResetService.verifyResetCode("test@test.com", "wrong"));
        
        assertEquals(1, reset.getAttempts());
        verify(passwordResetRepository).save(reset);
    }

    @Test
    void verifyResetCode_ShouldThrowException_WhenCodeExpired() {
        PasswordReset reset = new PasswordReset();
        reset.setExpiresAt(Instant.now().minus(1, ChronoUnit.MINUTES)); // Expired

        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(utilisateur));
        when(passwordResetRepository.findByUserIdAndUsedAtIsNull(1L)).thenReturn(Optional.of(reset));

        assertThrows(IllegalArgumentException.class, () -> passwordResetService.verifyResetCode("test@test.com", "123456"));
    }

    @Test
    void verifyResetCode_ShouldThrowException_WhenTooManyAttempts() {
        PasswordReset reset = new PasswordReset();
        reset.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        reset.setAttempts(5); // Max attempts assumed 5 from service constant

        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(utilisateur));
        when(passwordResetRepository.findByUserIdAndUsedAtIsNull(1L)).thenReturn(Optional.of(reset));

        assertThrows(IllegalArgumentException.class, () -> passwordResetService.verifyResetCode("test@test.com", "123456"));
    }

    @Test
    void verifyResetCode_ShouldReturnToken_WhenSuccess() {
        PasswordReset reset = new PasswordReset();
        reset.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        reset.setAttempts(0);
        String code = "123456";
        String hash = BCrypt.hashpw(code, BCrypt.gensalt());
        reset.setOtpHash(hash);

        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(utilisateur));
        when(passwordResetRepository.findByUserIdAndUsedAtIsNull(1L)).thenReturn(Optional.of(reset));

        String token = passwordResetService.verifyResetCode("test@test.com", code);

        assertNotNull(token);
        assertNotNull(reset.getResetToken());
        assertNotNull(reset.getUsedAt());
        verify(passwordResetRepository).save(reset);
    }
    
    @Test
    void resetPassword_ShouldThrowException_WhenTokenExpired() {
        PasswordReset reset = new PasswordReset();
        reset.setResetToken("token");
        reset.setResetExpiresAt(Instant.now().minus(1, ChronoUnit.MINUTES));

        when(passwordResetRepository.findByResetToken("token")).thenReturn(Optional.of(reset));

        assertThrows(IllegalArgumentException.class, () -> passwordResetService.resetPassword("token", "newPass"));
    }
    
    @Test
    void resetPassword_ShouldUpdatePassword_WhenTokenValid() {
        String token = "valid-token";
        PasswordReset reset = new PasswordReset();
        reset.setUserId(1L);
        reset.setResetToken(token);
        reset.setResetExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));

        when(passwordResetRepository.findByResetToken(token)).thenReturn(Optional.of(reset));
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(utilisateur));
        when(passwordEncoder.encode("newPass")).thenReturn("encodedNewPass");

        passwordResetService.resetPassword(token, "newPass");

        verify(utilisateurRepository).save(utilisateur);
        verify(passwordResetRepository).save(reset);
        assertNull(reset.getResetToken());
        assertEquals("encodedNewPass", utilisateur.getMotDePasse());
    }
}
