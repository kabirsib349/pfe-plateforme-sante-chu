package com.pfe.backend.service;

import com.pfe.backend.exception.OtpCooldownException;
import com.pfe.backend.exception.OtpExpiredException;
import com.pfe.backend.exception.OtpInvalidException;
import com.pfe.backend.exception.OtpNotFoundException;
import com.pfe.backend.exception.OtpTooManyAttemptsException;
import com.pfe.backend.model.OtpVerification;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.OtpVerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpVerificationRepository otpRepository;
    @Mock
    private MailService mailService;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private OtpService otpService;

    private Utilisateur utilisateur;

    @BeforeEach
    void setUp() {
        utilisateur = new Utilisateur();
        utilisateur.setId(1L);
        utilisateur.setEmail("test@test.com");
    }

    @Test
    void generateAndSendOtp_ShouldThrowException_WhenCooldownActive() {
        OtpVerification lastOtp = new OtpVerification();
        lastOtp.setCreatedAt(LocalDateTime.now().minusSeconds(30)); // Less than 60s cooldown

        when(otpRepository.findTopByUtilisateurOrderByCreatedAtDesc(utilisateur))
                .thenReturn(Optional.of(lastOtp));

        assertThrows(OtpCooldownException.class, () -> otpService.generateAndSendOtp(utilisateur));
    }

    @Test
    void generateAndSendOtp_ShouldSucceed_WhenCooldownExpired() {
        OtpVerification lastOtp = new OtpVerification();
        lastOtp.setCreatedAt(LocalDateTime.now().minusMinutes(2)); // > 60s ago

        when(otpRepository.findTopByUtilisateurOrderByCreatedAtDesc(utilisateur))
                .thenReturn(Optional.of(lastOtp));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedOtp");

        assertDoesNotThrow(() -> otpService.generateAndSendOtp(utilisateur));

        verify(otpRepository).deleteByUtilisateur(utilisateur);
        verify(otpRepository).save(any(OtpVerification.class));
    }

    @Test
    void generateAndSendOtp_ShouldSaveOtpAndSendEmail_WhenNoCooldown() {
        when(otpRepository.findTopByUtilisateurOrderByCreatedAtDesc(utilisateur))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedOtp");

        String otp = otpService.generateAndSendOtp(utilisateur);

        assertNotNull(otp);
        assertEquals(6, otp.length());

        verify(otpRepository).deleteByUtilisateur(utilisateur);
        verify(otpRepository).save(any(OtpVerification.class));
        verify(mailService).sendOtpEmail("test@test.com", otp, 5);
    }

    @Test
    void verifyOtp_ShouldThrowException_WhenNoOtpFound() {
        when(otpRepository.findTopByUtilisateurAndValideFalseOrderByExpirationDesc(utilisateur))
                .thenReturn(Optional.empty());

        assertThrows(OtpNotFoundException.class, () -> otpService.verifyOtp(utilisateur, "123456"));
    }

    @Test
    void verifyOtp_ShouldThrowException_WhenExpired() {
        OtpVerification otp = new OtpVerification();
        otp.setExpiration(LocalDateTime.now().minusMinutes(1)); // Expired

        when(otpRepository.findTopByUtilisateurAndValideFalseOrderByExpirationDesc(utilisateur))
                .thenReturn(Optional.of(otp));

        assertThrows(OtpExpiredException.class, () -> otpService.verifyOtp(utilisateur, "123456"));
    }

    @Test
    void verifyOtp_ShouldThrowException_WhenTooManyAttempts() {
        OtpVerification otp = new OtpVerification();
        otp.setExpiration(LocalDateTime.now().plusMinutes(5));
        otp.setTentatives(3); // Max attempts

        when(otpRepository.findTopByUtilisateurAndValideFalseOrderByExpirationDesc(utilisateur))
                .thenReturn(Optional.of(otp));

        assertThrows(OtpTooManyAttemptsException.class, () -> otpService.verifyOtp(utilisateur, "123456"));
    }

    @Test
    void verifyOtp_ShouldThrowException_WhenCodeIncorrect() {
        OtpVerification otp = new OtpVerification();
        otp.setExpiration(LocalDateTime.now().plusMinutes(5));
        otp.setTentatives(0);
        otp.setCodeHash("encodedCorrectOtp");

        when(otpRepository.findTopByUtilisateurAndValideFalseOrderByExpirationDesc(utilisateur))
                .thenReturn(Optional.of(otp));
        when(passwordEncoder.matches("123456", "encodedCorrectOtp")).thenReturn(false);

        assertThrows(OtpInvalidException.class, () -> otpService.verifyOtp(utilisateur, "123456"));
        assertEquals(1, otp.getTentatives());
        verify(otpRepository).save(otp);
    }

    @Test
    void verifyOtp_ShouldSucceed_WhenCodeValid() {
        OtpVerification otp = new OtpVerification();
        otp.setExpiration(LocalDateTime.now().plusMinutes(5));
        otp.setTentatives(0);
        otp.setCodeHash("encodedCorrectOtp");

        when(otpRepository.findTopByUtilisateurAndValideFalseOrderByExpirationDesc(utilisateur))
                .thenReturn(Optional.of(otp));
        when(passwordEncoder.matches("123456", "encodedCorrectOtp")).thenReturn(true);

        assertDoesNotThrow(() -> otpService.verifyOtp(utilisateur, "123456"));
        assertTrue(otp.isValide());
        verify(otpRepository).save(otp);
    }
}
