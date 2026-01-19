package com.pfe.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.dto.ReponseFormulaireRequest;
import com.pfe.backend.dto.StatistiqueFormulaireDto;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.service.CsvExportService;
import com.pfe.backend.service.ReponseFormulaireService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReponseFormulaireControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReponseFormulaireService reponseFormulaireService;

    @Mock
    private CsvExportService csvExportService;

    @InjectMocks
    private ReponseFormulaireController reponseController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Principal mockPrincipal;
    private ReponseFormulaire testReponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reponseController).build();
        mockPrincipal = () -> "medecin@test.com";

        testReponse = new ReponseFormulaire();
        testReponse.setIdReponse(1L);
        testReponse.setPatientIdentifier("PAT001");
        testReponse.setValeur("Test réponse");
    }

    // ==================== POST /api/reponses ====================

    @Test
    void sauvegarderReponses_ShouldReturnOk() throws Exception {
        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(1L);
        request.setPatientIdentifier("PAT001");

        doNothing().when(reponseFormulaireService)
                .sauvegarderReponses(any(ReponseFormulaireRequest.class), eq("medecin@test.com"), eq(false));

        mockMvc.perform(post("/api/reponses")
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void sauvegarderReponses_WithBrouillon_ShouldReturnOk() throws Exception {
        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(1L);
        request.setPatientIdentifier("PAT001");

        doNothing().when(reponseFormulaireService)
                .sauvegarderReponses(any(ReponseFormulaireRequest.class), eq("medecin@test.com"), eq(true));

        mockMvc.perform(post("/api/reponses")
                .principal(mockPrincipal)
                .param("brouillon", "true")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    // ==================== POST /api/reponses/marquer-lu/{id} ====================

    @Test
    void marquerCommeLu_ShouldReturnOk() throws Exception {
        doNothing().when(reponseFormulaireService).marquerCommeLu(1L, "medecin@test.com");

        mockMvc.perform(post("/api/reponses/marquer-lu/1").principal(mockPrincipal))
                .andExpect(status().isOk());
    }

    // ==================== GET /api/reponses/{id} ====================

    @Test
    void getReponses_ShouldReturnList() throws Exception {
        when(reponseFormulaireService.getReponses(1L)).thenReturn(List.of(testReponse));

        mockMvc.perform(get("/api/reponses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].patientIdentifier").value("PAT001"));
    }

    @Test
    void getReponses_ShouldReturnEmptyList_WhenNoReponses() throws Exception {
        when(reponseFormulaireService.getReponses(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/reponses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ==================== GET /api/reponses/{id}/patient/{patientId} ====================

    @Test
    void getReponsesByPatient_ShouldReturnList() throws Exception {
        when(reponseFormulaireService.getReponsesByPatient(1L, "PAT001"))
                .thenReturn(List.of(testReponse));

        mockMvc.perform(get("/api/reponses/1/patient/PAT001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ==================== GET /api/reponses/{id}/patients ====================

    @Test
    void getPatientIdentifiers_ShouldReturnList() throws Exception {
        when(reponseFormulaireService.getPatientIdentifiers(1L))
                .thenReturn(List.of("PAT001", "PAT002", "PAT003"));

        mockMvc.perform(get("/api/reponses/1/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0]").value("PAT001"));
    }

    // ==================== DELETE /api/reponses/{id} ====================

    @Test
    void supprimerToutesReponses_ShouldReturnOk() throws Exception {
        doNothing().when(reponseFormulaireService)
                .supprimerToutesReponsesFormulaire(1L, "medecin@test.com");

        mockMvc.perform(delete("/api/reponses/1").principal(mockPrincipal))
                .andExpect(status().isOk());
    }

    // ==================== DELETE /api/reponses/{id}/patient/{patientId} ====================

    @Test
    void supprimerReponsesPatient_ShouldReturnNoContent() throws Exception {
        doNothing().when(reponseFormulaireService)
                .supprimerReponsesPatient(1L, "PAT001", "medecin@test.com");

        mockMvc.perform(delete("/api/reponses/1/patient/PAT001").principal(mockPrincipal))
                .andExpect(status().isNoContent());
    }

    // ==================== GET /api/reponses/{id}/statistiques ====================

    @Test
    void getStatistiques_ShouldReturnStats() throws Exception {
        StatistiqueFormulaireDto stats = new StatistiqueFormulaireDto(50, 10);

        when(reponseFormulaireService.getStatistiques(1L)).thenReturn(stats);

        mockMvc.perform(get("/api/reponses/1/statistiques"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreReponsesCompletes").value(50))
                .andExpect(jsonPath("$.nombreReponsesEnCours").value(10));
    }

    // ==================== GET /api/reponses/{id}/drafts ====================

    @Test
    void getAllDrafts_ShouldReturnList() throws Exception {
        Map<String, Object> draft1 = new HashMap<>();
        draft1.put("patientIdentifier", "PAT001");
        draft1.put("reponses", List.of());

        Map<String, Object> draft2 = new HashMap<>();
        draft2.put("patientIdentifier", "PAT002");
        draft2.put("reponses", List.of());

        when(reponseFormulaireService.getAllDraftsForFormulaire(1L))
                .thenReturn(List.of(draft1, draft2));

        mockMvc.perform(get("/api/reponses/1/drafts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ==================== GET /api/reponses/{id}/draft/{patientId} ====================

    @Test
    void getDraftForPatient_ShouldReturnDraft() throws Exception {
        Map<String, Object> draft = new HashMap<>();
        draft.put("patientIdentifier", "PAT001");
        draft.put("reponses", List.of());

        when(reponseFormulaireService.getDraftForPatient(1L, "PAT001"))
                .thenReturn(draft);

        mockMvc.perform(get("/api/reponses/1/draft/PAT001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.patientIdentifier").value("PAT001"));
    }

    @Test
    void getDraftForPatient_ShouldReturnNoContent_WhenNoDraft() throws Exception {
        when(reponseFormulaireService.getDraftForPatient(1L, "PAT001"))
                .thenReturn(null);

        mockMvc.perform(get("/api/reponses/1/draft/PAT001"))
                .andExpect(status().isNoContent());
    }

    // ==================== GET /api/reponses/export/{id} ====================

    @Test
    void exportCSV_ShouldReturnCsvFile() throws Exception {
        when(reponseFormulaireService.getReponses(1L)).thenReturn(List.of(testReponse));
        when(csvExportService.generateCsvContent(any())).thenReturn("patientId,valeur\nPAT001,Test");

        mockMvc.perform(get("/api/reponses/export/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv; charset=UTF-8"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=formulaire_1.csv"));
    }

    @Test
    void exportCSV_ShouldReturnEmptyCsv_WhenNoData() throws Exception {
        when(reponseFormulaireService.getReponses(1L)).thenReturn(List.of());
        when(csvExportService.generateCsvContent(List.of())).thenReturn("patientId");

        mockMvc.perform(get("/api/reponses/export/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv; charset=UTF-8"));
    }
}
