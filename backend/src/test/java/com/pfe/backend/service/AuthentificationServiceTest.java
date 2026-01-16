package com.pfe.backend.service;

import com.pfe.backend.dto.LoginRequest;
import com.pfe.backend.dto.LoginResponse;
import com.pfe.backend.dto.RegisterRequest;
import com.pfe.backend.model.Role;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.RoleRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthentificationServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private AuthentificationService authService;

    @Test
    void register_ShouldSaveUser_WhenEmailIsNotTaken() {
        RegisterRequest request = new RegisterRequest();
        request.setNom("Test User");
        request.setEmail("test@email.com");
        request.setPassword("password");
        request.setRole("chercheur");

        Role role = new Role();
        role.setNom("chercheur");

        when(utilisateurRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(roleRepository.findByNom("chercheur")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");

        authService.register(request);

        verify(utilisateurRepository).save(any(Utilisateur.class));
    }

    @Test
    void register_ShouldDefaultToChercheur_WhenRoleIsNull() {
        RegisterRequest request = new RegisterRequest();
        request.setNom("Test User");
        request.setEmail("test@email.com");
        request.setPassword("password");
        request.setRole(null); // Explicitly null

        Role role = new Role();
        role.setNom("chercheur");

        when(utilisateurRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(roleRepository.findByNom("chercheur")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");

        authService.register(request);

        verify(roleRepository).findByNom("chercheur");
        verify(utilisateurRepository).save(any(Utilisateur.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailIsTaken() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("taken@email.com");

        when(utilisateurRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(new Utilisateur()));

        assertThrows(IllegalStateException.class, () -> authService.register(request));
    }
    
    @Test
    void register_ShouldThrowException_WhenRoleNotFound() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@email.com");
        request.setRole("unknown_role");
        
        when(utilisateurRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(roleRepository.findByNom("unknown_role")).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> authService.register(request));
    }

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@email.com");
        request.setPassword("password");

        Utilisateur user = new Utilisateur();
        user.setEmail("test@email.com");
        user.setMotDePasse("encodedPassword");
        Role role = new Role();
        role.setNom("chercheur");
        user.setRole(role);

        when(utilisateurRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("jwt-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@email.com");
        request.setPassword("password");

        when(utilisateurRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> authService.login(request));
    }
}
