package com.pfe.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.dto.LoginRequest;
import com.pfe.backend.dto.LoginResponse;
import com.pfe.backend.dto.RegisterRequest;
import com.pfe.backend.service.AuthentificationService;
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

        LoginResponse response = new LoginResponse("token");
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
}
