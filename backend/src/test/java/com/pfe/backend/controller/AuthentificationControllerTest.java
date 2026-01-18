package com.pfe.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.dto.*;
import com.pfe.backend.exception.*;
import com.pfe.backend.service.AuthentificationService;
import com.pfe.backend.service.PasswordResetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@ExtendWith(MockitoExtension.class)
class AuthentificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthentificationService authentificationService;

    @Mock
    private PasswordResetService passwordResetService;

    @InjectMocks
    private AuthentificationController authentificationController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authentificationController).build();
    }

    @Test
    void register_ShouldReturnCreated_WhenServiceSucceeds() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setNom("Test");
        request.setEmail("test@test.com");
        request.setPassword("Password123!");
        request.setRole("chercheur");

        doNothing().when(authentificationService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Utilisateur enregistré avec succès."));
    }

    @Test
    void register_ShouldReturnBadRequest_WhenServiceThrowsIllegalStateException() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setNom("Test");
        request.setEmail("test@test.com");
        request.setPassword("Password123!");
        request.setRole("chercheur");

        doThrow(new IllegalStateException("Email exists")).when(authentificationService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Email exists"));
    }

    @Test
    void login_ShouldReturnOkDoubledProtocol_WhenServiceSucceeds() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");

        LoginResponse response = new LoginResponse("token", false);
        when(authentificationService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().json(objectMapper.writeValueAsString(response)));
    }

    @Test
    void login_ShouldReturnUnauthorized_WhenServiceThrowsException() throws Exception {
        // Arrange - Test the catch block for Exception
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("wrongpassword");

        when(authentificationService.login(any(LoginRequest.class)))
                .thenThrow(new RuntimeException("Authentication failed"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_ShouldReturnTooManyRequests_WhenServiceThrowsOtpCooldownException() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("password");

        when(authentificationService.login(any(LoginRequest.class)))
                .thenThrow(new OtpCooldownException("Trop de tentatives"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(content().json(objectMapper.writeValueAsString(new PasswordResetDTO.GenericResponse("Trop de tentatives"))));
    }

    @Test
    void verifyOtp_ShouldReturnOk_WhenServiceSucceeds() throws Exception {
        VerifyOtpRequest request = new VerifyOtpRequest("test@test.com", "123456");

        LoginResponse response = new LoginResponse("token", false);
        when(authentificationService.verifyOtp(any(VerifyOtpRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().json(objectMapper.writeValueAsString(response)));
    }

    @Test
    void verifyOtp_ShouldReturnBadRequest_WhenServiceThrowsException() throws Exception {
        VerifyOtpRequest request = new VerifyOtpRequest("test@test.com", "123456");

        when(authentificationService.verifyOtp(any(VerifyOtpRequest.class)))
                .thenThrow(new OtpInvalidException("Code invalide"));

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(objectMapper.writeValueAsString(new PasswordResetDTO.GenericResponse("Code invalide"))));
    }

    @Test
    void forgotPassword_ShouldReturnOk_WhenServiceSucceeds() throws Exception {
        PasswordResetDTO.ForgotPasswordRequest request = new PasswordResetDTO.ForgotPasswordRequest("test@test.com");

        doNothing().when(passwordResetService).forgotPassword(anyString());

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().json(objectMapper.writeValueAsString(new PasswordResetDTO.GenericResponse(
                        "Si un compte existe avec cette adresse, un code de vérification a été envoyé."))));
    }

    @Test
    void verifyResetCode_ShouldReturnOk_WhenServiceSucceeds() throws Exception {
        PasswordResetDTO.VerifyResetCodeRequest request = new PasswordResetDTO.VerifyResetCodeRequest("test@test.com", "123456");

        when(passwordResetService.verifyResetCode(anyString(), anyString())).thenReturn("reset-token");

        mockMvc.perform(post("/api/auth/verify-reset-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().json(objectMapper.writeValueAsString(new PasswordResetDTO.VerifyResetCodeResponse("reset-token"))));
    }

    @Test
    void verifyResetCode_ShouldReturnBadRequest_WhenServiceThrowsException() throws Exception {
        PasswordResetDTO.VerifyResetCodeRequest request = new PasswordResetDTO.VerifyResetCodeRequest("test@test.com", "123456");

        when(passwordResetService.verifyResetCode(anyString(), anyString()))
                .thenThrow(new IllegalArgumentException("Code invalide"));

        mockMvc.perform(post("/api/auth/verify-reset-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(objectMapper.writeValueAsString(new PasswordResetDTO.GenericResponse("Code invalide"))));
    }

    @Test
    void resetPassword_ShouldReturnOk_WhenServiceSucceeds() throws Exception {
        PasswordResetDTO.ResetPasswordRequest request = new PasswordResetDTO.ResetPasswordRequest("reset-token", "NewPass123!");

        doNothing().when(passwordResetService).resetPassword(anyString(), anyString());

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().json(objectMapper.writeValueAsString(new PasswordResetDTO.GenericResponse(
                        "Votre mot de passe a été réinitialisé avec succès."))));
    }

    @Test
    void resetPassword_ShouldReturnBadRequest_WhenServiceThrowsException() throws Exception {
        PasswordResetDTO.ResetPasswordRequest request = new PasswordResetDTO.ResetPasswordRequest("reset-token", "NewPass123!");

        doThrow(new IllegalArgumentException("Token invalide")).when(passwordResetService).resetPassword(anyString(), anyString());

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(objectMapper.writeValueAsString(new PasswordResetDTO.GenericResponse("Token invalide"))));
    }
}
