package com.pfe.backend.service;

import com.pfe.backend.dto.ChangePasswordRequest;
import com.pfe.backend.dto.UserUpdateRequest;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UtilisateurRepository repository;

    @InjectMocks
    private UserService userService;

    @Test
    void getUser_ShouldReturnUser_WhenFound() {
        // Arrange
        String email = "test@example.com";
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setEmail(email);
        utilisateur.setNom("Test User");

        when(repository.findByEmail(email)).thenReturn(Optional.of(utilisateur));

        // Act
        Utilisateur result = userService.getUser(email);

        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
    }

    @Test
    void getUser_ShouldThrowException_WhenNotFound() {
        // Arrange
        String email = "unknown@example.com";
        when(repository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> userService.getUser(email));
    }

    @Test
    void updateProfile_ShouldUpdateNomAndEmail_WhenValid() {
        // Arrange
        String currentEmail = "current@example.com";
        Utilisateur user = new Utilisateur();
        user.setEmail(currentEmail);
        user.setNom("Old Name");

        UserUpdateRequest dto = new UserUpdateRequest();
        dto.setNom("New Name");
        dto.setEmail("new@example.com");

        when(repository.findByEmail(currentEmail)).thenReturn(Optional.of(user));
        when(repository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(repository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Utilisateur result = userService.updateProfile(currentEmail, dto);

        // Assert
        assertEquals("New Name", result.getNom());
        assertEquals("new@example.com", result.getEmail());
    }

    @Test
    void updateProfile_ShouldOnlyUpdateNom_WhenEmailIsNull() {
        // Arrange
        String currentEmail = "current@example.com";
        Utilisateur user = new Utilisateur();
        user.setEmail(currentEmail);
        user.setNom("Old Name");

        UserUpdateRequest dto = new UserUpdateRequest();
        dto.setNom("New Name");
        dto.setEmail(null);

        when(repository.findByEmail(currentEmail)).thenReturn(Optional.of(user));
        when(repository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Utilisateur result = userService.updateProfile(currentEmail, dto);

        // Assert
        assertEquals("New Name", result.getNom());
        assertEquals(currentEmail, result.getEmail());
    }

    @Test
    void updateProfile_ShouldOnlyUpdateEmail_WhenNomIsEmpty() {
        // Arrange
        String currentEmail = "current@example.com";
        Utilisateur user = new Utilisateur();
        user.setEmail(currentEmail);
        user.setNom("Old Name");

        UserUpdateRequest dto = new UserUpdateRequest();
        dto.setNom("");
        dto.setEmail("new@example.com");

        when(repository.findByEmail(currentEmail)).thenReturn(Optional.of(user));
        when(repository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(repository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Utilisateur result = userService.updateProfile(currentEmail, dto);

        // Assert
        assertEquals("Old Name", result.getNom());
        assertEquals("new@example.com", result.getEmail());
    }

    @Test
    void updateProfile_ShouldThrowException_WhenEmailAlreadyTaken() {
        // Arrange
        String currentEmail = "current@example.com";
        Utilisateur user = new Utilisateur();
        user.setEmail(currentEmail);

        Utilisateur existingUser = new Utilisateur();
        existingUser.setEmail("taken@example.com");

        UserUpdateRequest dto = new UserUpdateRequest();
        dto.setEmail("taken@example.com");

        when(repository.findByEmail(currentEmail)).thenReturn(Optional.of(user));
        when(repository.findByEmail("taken@example.com")).thenReturn(Optional.of(existingUser));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> userService.updateProfile(currentEmail, dto));
    }

    @Test
    void updateProfile_ShouldAllowSameEmail_WhenNotChanged() {
        // Arrange
        String currentEmail = "current@example.com";
        Utilisateur user = new Utilisateur();
        user.setEmail(currentEmail);
        user.setNom("Old Name");

        UserUpdateRequest dto = new UserUpdateRequest();
        dto.setNom("New Name");
        dto.setEmail(currentEmail); // Same email

        when(repository.findByEmail(currentEmail)).thenReturn(Optional.of(user));
        when(repository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Utilisateur result = userService.updateProfile(currentEmail, dto);

        // Assert
        assertEquals("New Name", result.getNom());
        assertEquals(currentEmail, result.getEmail());
    }

    @Test
    void updateProfile_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        String email = "unknown@example.com";
        UserUpdateRequest dto = new UserUpdateRequest();

        when(repository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> userService.updateProfile(email, dto));
    }

    @Test
    void changePassword_ShouldUpdatePassword_WhenValid() {
        // Arrange
        String email = "test@example.com";
        Utilisateur user = new Utilisateur();
        user.setEmail(email);
        user.setMotDePasse("encodedOldPassword");

        ChangePasswordRequest dto = new ChangePasswordRequest();
        dto.setCurrentPassword("oldPassword");
        dto.setNewPassword("newPassword");
        dto.setConfirmationPassword("newPassword");

        when(repository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPassword", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(repository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        userService.changePassword(email, dto);

        // Assert
        verify(repository).save(user);
        assertEquals("encodedNewPassword", user.getMotDePasse());
    }

    @Test
    void changePassword_ShouldThrowException_WhenCurrentPasswordIncorrect() {
        // Arrange
        String email = "test@example.com";
        Utilisateur user = new Utilisateur();
        user.setEmail(email);
        user.setMotDePasse("encodedOldPassword");

        ChangePasswordRequest dto = new ChangePasswordRequest();
        dto.setCurrentPassword("wrongPassword");
        dto.setNewPassword("newPassword");
        dto.setConfirmationPassword("newPassword");

        when(repository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedOldPassword")).thenReturn(false);

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, 
            () -> userService.changePassword(email, dto));
        assertTrue(exception.getMessage().contains("actuel"));
    }

    @Test
    void changePassword_ShouldThrowException_WhenPasswordsDoNotMatch() {
        // Arrange
        String email = "test@example.com";
        Utilisateur user = new Utilisateur();
        user.setEmail(email);
        user.setMotDePasse("encodedOldPassword");

        ChangePasswordRequest dto = new ChangePasswordRequest();
        dto.setCurrentPassword("oldPassword");
        dto.setNewPassword("newPassword");
        dto.setConfirmationPassword("differentPassword");

        when(repository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPassword", "encodedOldPassword")).thenReturn(true);

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, 
            () -> userService.changePassword(email, dto));
        assertTrue(exception.getMessage().contains("correspondent pas"));
    }

    @Test
    void changePassword_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        String email = "unknown@example.com";
        ChangePasswordRequest dto = new ChangePasswordRequest();

        when(repository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> userService.changePassword(email, dto));
    }
}
