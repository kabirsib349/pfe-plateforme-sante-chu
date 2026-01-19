package com.pfe.backend.controller;

import com.pfe.backend.model.Activite;
import com.pfe.backend.repository.ActiviteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ActiviteRepository activiteRepository;

    @InjectMocks
    private DashboardController dashboardController;

    private Principal mockPrincipal;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(dashboardController).build();
        mockPrincipal = () -> "test@test.com";
    }

    // ==================== GET /api/dashboard/activity ====================

    @Test
    void getRecentActivity_ShouldReturnActivities_WithDefaultLimit() throws Exception {
        Activite activite1 = new Activite();
        activite1.setIdActivite(1L);
        activite1.setAction("Formulaire créé");

        Activite activite2 = new Activite();
        activite2.setIdActivite(2L);
        activite2.setAction("Réponse soumise");

        when(activiteRepository.findRecentByUserEmail("test@test.com", 10))
                .thenReturn(List.of(activite1, activite2));

        mockMvc.perform(get("/api/dashboard/activity").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].action").value("Formulaire créé"))
                .andExpect(jsonPath("$[1].action").value("Réponse soumise"));

        verify(activiteRepository).findRecentByUserEmail("test@test.com", 10);
    }

    @Test
    void getRecentActivity_ShouldReturnActivities_WithCustomLimit() throws Exception {
        Activite activite1 = new Activite();
        activite1.setIdActivite(1L);
        activite1.setAction("Formulaire créé");

        when(activiteRepository.findRecentByUserEmail("test@test.com", 5))
                .thenReturn(List.of(activite1));

        mockMvc.perform(get("/api/dashboard/activity")
                .principal(mockPrincipal)
                .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(activiteRepository).findRecentByUserEmail("test@test.com", 5);
    }

    @Test
    void getRecentActivity_ShouldReturnEmptyList_WhenNoActivities() throws Exception {
        when(activiteRepository.findRecentByUserEmail("test@test.com", 10))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/dashboard/activity").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ==================== GET /api/dashboard/activity/all ====================

    @Test
    void getAllActivity_ShouldReturnAllActivities() throws Exception {
        Activite activite1 = new Activite();
        activite1.setIdActivite(1L);
        activite1.setAction("Formulaire créé");

        Activite activite2 = new Activite();
        activite2.setIdActivite(2L);
        activite2.setAction("Réponse soumise");

        Activite activite3 = new Activite();
        activite3.setIdActivite(3L);
        activite3.setAction("Export CSV");

        when(activiteRepository.findByUserEmailOrderByDateDesc("test@test.com"))
                .thenReturn(List.of(activite1, activite2, activite3));

        mockMvc.perform(get("/api/dashboard/activity/all").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].action").value("Formulaire créé"))
                .andExpect(jsonPath("$[2].action").value("Export CSV"));

        verify(activiteRepository).findByUserEmailOrderByDateDesc("test@test.com");
    }

    @Test
    void getAllActivity_ShouldReturnEmptyList_WhenNoActivities() throws Exception {
        when(activiteRepository.findByUserEmailOrderByDateDesc("test@test.com"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/dashboard/activity/all").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
