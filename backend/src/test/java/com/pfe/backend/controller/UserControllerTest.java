package com.pfe.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.dto.*;
import com.pfe.backend.model.Role;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import com.pfe.backend.service.FormulaireMedecinService;
import com.pfe.backend.service.UserService;
import com.pfe.backend.service.UtilisateurService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private FormulaireMedecinService formulaireMedecinService;

    @Mock
    private UserService userService;

    @Mock
    private UtilisateurService utilisateurService;

    @InjectMocks
    private UserController userController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Principal mockPrincipal;
    private Utilisateur testUser;
    private Role testRole;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        
        mockPrincipal = () -> "test@test.com";
        
        testRole = new Role();
        testRole.setId(1);
        testRole.setNom("chercheur");
        
        testUser = new Utilisateur();
        testUser.setId(1L);
        testUser.setNom("Test User");
        testUser.setEmail("test@test.com");
        testUser.setRole(testRole);
    }

    // ==================== GET /api/users/me ====================

    @Test
    void getCurrentUser_ShouldReturnUser_WhenUserExists() throws Exception {
        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/api/users/me").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nom").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@test.com"))
                .andExpect(jsonPath("$.role").value("chercheur"));

        verify(utilisateurRepository).findByEmail("test@test.com");
    }

    // Note: Le test pour UsernameNotFoundException nécessiterait un @ControllerAdvice
    // pour retourner 404 au lieu de 500. Ce comportement est géré par la configuration globale.

    // ==================== GET /api/users/medecins ====================

    @Test
    void getMedecins_ShouldReturnListOfMedecins() throws Exception {
        Role medecinRole = new Role();
        medecinRole.setId(2);
        medecinRole.setNom("medecin");

        Utilisateur medecin1 = new Utilisateur();
        medecin1.setId(1L);
        medecin1.setNom("Dr. Dupont");
        medecin1.setEmail("dupont@chu.fr");
        medecin1.setRole(medecinRole);

        Utilisateur medecin2 = new Utilisateur();
        medecin2.setId(2L);
        medecin2.setNom("Dr. Martin");
        medecin2.setEmail("martin@chu.fr");
        medecin2.setRole(medecinRole);

        when(formulaireMedecinService.getMedecins()).thenReturn(List.of(medecin1, medecin2));

        mockMvc.perform(get("/api/users/medecins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nom").value("Dr. Dupont"))
                .andExpect(jsonPath("$[1].nom").value("Dr. Martin"));

        verify(formulaireMedecinService).getMedecins();
    }

    @Test
    void getMedecins_ShouldReturnEmptyList_WhenNoMedecins() throws Exception {
        when(formulaireMedecinService.getMedecins()).thenReturn(List.of());

        mockMvc.perform(get("/api/users/medecins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ==================== GET /api/users/chercheurs ====================

    @Test
    void getChercheurs_ShouldReturnListOfChercheurs() throws Exception {
        UtilisateurDto chercheur1 = new UtilisateurDto(1L, "Prof. Durand", "durand@chu.fr", "chercheur");
        UtilisateurDto chercheur2 = new UtilisateurDto(2L, "Prof. Bernard", "bernard@chu.fr", "chercheur");

        when(utilisateurService.getChercheurs()).thenReturn(List.of(chercheur1, chercheur2));

        mockMvc.perform(get("/api/users/chercheurs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nom").value("Prof. Durand"))
                .andExpect(jsonPath("$[1].nom").value("Prof. Bernard"));

        verify(utilisateurService).getChercheurs();
    }

    @Test
    void getChercheurs_ShouldReturnEmptyList_WhenNoChercheurs() throws Exception {
        when(utilisateurService.getChercheurs()).thenReturn(List.of());

        mockMvc.perform(get("/api/users/chercheurs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ==================== PUT /api/users/profile ====================

    @Test
    void updateProfile_ShouldReturnUpdatedUser_WhenSuccess() throws Exception {
        UserUpdateRequest dto = new UserUpdateRequest();
        dto.setNom("Updated Name");
        dto.setEmail("updated@test.com");

        Utilisateur updatedUser = new Utilisateur();
        updatedUser.setId(1L);
        updatedUser.setNom("Updated Name");
        updatedUser.setEmail("updated@test.com");
        updatedUser.setRole(testRole);

        when(userService.updateProfile(anyString(), any(UserUpdateRequest.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/api/users/profile")
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Updated Name"))
                .andExpect(jsonPath("$.email").value("updated@test.com"));

        verify(userService).updateProfile(eq("test@test.com"), any(UserUpdateRequest.class));
    }

    @Test
    void updateProfile_ShouldReturnUnauthorized_WhenPrincipalIsNull() throws Exception {
        UserUpdateRequest dto = new UserUpdateRequest();
        dto.setNom("Updated Name");

        mockMvc.perform(put("/api/users/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Utilisateur non authentifié"));
    }

    @Test
    void updateProfile_ShouldHandleUserWithNullRole() throws Exception {
        UserUpdateRequest dto = new UserUpdateRequest();
        dto.setNom("Updated Name");

        Utilisateur updatedUser = new Utilisateur();
        updatedUser.setId(1L);
        updatedUser.setNom("Updated Name");
        updatedUser.setEmail("updated@test.com");
        updatedUser.setRole(null); // role is null

        when(userService.updateProfile(anyString(), any(UserUpdateRequest.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/api/users/profile")
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").doesNotExist());
    }

    // ==================== PUT /api/users/changer-mot-de-passe ====================

    @Test
    void changePassword_ShouldReturnOk_WhenSuccess() throws Exception {
        ChangePasswordRequest dto = new ChangePasswordRequest();
        dto.setCurrentPassword("oldPass123!");
        dto.setNewPassword("newPass456!");

        doNothing().when(userService).changePassword(anyString(), any(ChangePasswordRequest.class));

        mockMvc.perform(put("/api/users/changer-mot-de-passe")
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Mot de passe mis à jour avec succès !"));

        verify(userService).changePassword(eq("test@test.com"), any(ChangePasswordRequest.class));
    }

    @Test
    void changePassword_ShouldReturnUnauthorized_WhenPrincipalIsNull() throws Exception {
        ChangePasswordRequest dto = new ChangePasswordRequest();
        dto.setCurrentPassword("oldPass123!");
        dto.setNewPassword("newPass456!");

        mockMvc.perform(put("/api/users/changer-mot-de-passe")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Utilisateur non authentifié"));
    }
}
