package com.pfe.backend.controller;

import com.pfe.backend.service.ExportReponsesService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.security.Principal;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ExportReponsesControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ExportReponsesService exportReponsesService;

    @InjectMocks
    private ExportReponsesController exportController;

    private Principal mockPrincipal;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(exportController).build();
        mockPrincipal = () -> "chercheur@test.com";
    }

    // ==================== GET /api/export/formulaires/{formulaireId}/csv ====================

    @Test
    void exporterReponsesCsv_ShouldReturnCsvFile() throws Exception {
        String csvContent = "patient_id,question1,question2\n1,valeur1,valeur2\n2,valeur3,valeur4";
        ByteArrayResource resource = new ByteArrayResource(csvContent.getBytes(StandardCharsets.UTF_8));

        when(exportReponsesService.exporterReponsesCsv(eq(1L), eq("chercheur@test.com")))
                .thenReturn(resource);

        mockMvc.perform(get("/api/export/formulaires/1/csv").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"formulaire_1_reponses.csv\""));

        verify(exportReponsesService).exporterReponsesCsv(1L, "chercheur@test.com");
    }

    @Test
    void exporterReponsesCsv_ShouldReturnEmptyCsv_WhenNoData() throws Exception {
        String csvContent = "patient_id\n";
        ByteArrayResource resource = new ByteArrayResource(csvContent.getBytes(StandardCharsets.UTF_8));

        when(exportReponsesService.exporterReponsesCsv(eq(2L), eq("chercheur@test.com")))
                .thenReturn(resource);

        mockMvc.perform(get("/api/export/formulaires/2/csv").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"));

        verify(exportReponsesService).exporterReponsesCsv(2L, "chercheur@test.com");
    }
}
