package com.pfe.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.dto.*;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.service.FormulaireMedecinService;
import com.pfe.backend.service.FormulaireService;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FormulaireControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FormulaireService formulaireService;

    @Mock
    private FormulaireMedecinService formulaireMedecinService;

    @Mock
    private ReponseFormulaireService reponseFormulaireService;

    @InjectMocks
    private FormulaireController formulaireController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Principal mockPrincipal;
    private Formulaire testFormulaire;
    private FormulaireMedecin testFormulaireMedecin;
    private Utilisateur chercheur;
    private Utilisateur medecin;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(formulaireController).build();
        mockPrincipal = () -> "chercheur@test.com";

        chercheur = new Utilisateur();
        chercheur.setId(1L);
        chercheur.setEmail("chercheur@test.com");

        medecin = new Utilisateur();
        medecin.setId(2L);
        medecin.setEmail("medecin@test.com");

        testFormulaire = new Formulaire();
        testFormulaire.setIdFormulaire(1L);
        testFormulaire.setTitre("Formulaire Test");
        testFormulaire.setDescription("Description test");
        testFormulaire.setChercheur(chercheur);

        testFormulaireMedecin = new FormulaireMedecin();
        testFormulaireMedecin.setId(1L);
        testFormulaireMedecin.setFormulaire(testFormulaire);
        testFormulaireMedecin.setMedecin(medecin);
        testFormulaireMedecin.setDateEnvoi(LocalDateTime.now());
    }

    // Helper method to create a valid FormulaireRequest
    private FormulaireRequest createValidFormulaireRequest(String titre, String titreEtude) {
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre(titre);
        request.setDescription("Description");
        request.setTitreEtude(titreEtude);
        request.setDescriptionEtude("Description étude");
        request.setStatut("BROUILLON");
        
        // Create a valid ChampRequest
        ChampRequest champ = new ChampRequest();
        champ.setLabel("Question 1");
        champ.setType("TEXTE");
        request.setChamps(List.of(champ));
        
        return request;
    }

    // ==================== POST /api/formulaires ====================

    @Test
    void createFormulaire_ShouldReturnCreatedFormulaire() throws Exception {
        FormulaireRequest request = createValidFormulaireRequest("Nouveau formulaire", "Étude Test");

        when(formulaireService.createFormulaire(any(FormulaireRequest.class), eq("chercheur@test.com")))
                .thenReturn(testFormulaire);

        mockMvc.perform(post("/api/formulaires")
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idFormulaire").value(1))
                .andExpect(jsonPath("$.titre").value("Formulaire Test"));
    }

    // ==================== POST /api/formulaires/{id}/envoyer ====================

    @Test
    void envoyerFormulaire_ShouldReturnOk() throws Exception {
        EnvoiFormulaireRequest request = new EnvoiFormulaireRequest();
        request.setEmailMedecin("medecin@test.com");

        when(formulaireMedecinService.envoyerFormulaire(1L, "medecin@test.com", "chercheur@test.com"))
                .thenReturn(testFormulaireMedecin);

        mockMvc.perform(post("/api/formulaires/1/envoyer")
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    // ==================== POST /api/formulaires/{id}/create-envoi ====================

    @Test
    void createEnvoiParChercheur_ShouldReturnCreated() throws Exception {
        when(formulaireMedecinService.createEnvoiParChercheur(1L, "chercheur@test.com"))
                .thenReturn(testFormulaireMedecin);

        mockMvc.perform(post("/api/formulaires/1/create-envoi")
                .principal(mockPrincipal))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void createEnvoiParChercheur_ShouldHandleNullFormulaire() throws Exception {
        FormulaireMedecin fmWithNullFormulaire = new FormulaireMedecin();
        fmWithNullFormulaire.setId(2L);
        fmWithNullFormulaire.setFormulaire(null);
        fmWithNullFormulaire.setDateEnvoi(null);

        when(formulaireMedecinService.createEnvoiParChercheur(2L, "chercheur@test.com"))
                .thenReturn(fmWithNullFormulaire);

        mockMvc.perform(post("/api/formulaires/2/create-envoi")
                .principal(mockPrincipal))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2));
    }

    // ==================== GET /api/formulaires ====================

    @Test
    void getFormulaires_ShouldReturnList() throws Exception {
        when(formulaireService.getFormulairesByChercheurEmail("chercheur@test.com"))
                .thenReturn(List.of(testFormulaire));

        mockMvc.perform(get("/api/formulaires").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].titre").value("Formulaire Test"));
    }

    @Test
    void getFormulaires_ShouldReturnEmptyList_WhenNoFormulaires() throws Exception {
        when(formulaireService.getFormulairesByChercheurEmail("chercheur@test.com"))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/formulaires").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ==================== GET /api/formulaires/recus ====================

    @Test
    void getFormulairesRecus_ShouldReturnList() throws Exception {
        Principal medecinPrincipal = () -> "medecin@test.com";
        
        when(formulaireMedecinService.getFormulairesRecus("medecin@test.com"))
                .thenReturn(List.of(testFormulaireMedecin));
        when(reponseFormulaireService.countDrafts(1L)).thenReturn(2);

        mockMvc.perform(get("/api/formulaires/recus").principal(medecinPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ==================== GET /api/formulaires/recus/{id} ====================

    @Test
    void getFormulaireRecuById_ShouldReturnFormulaire() throws Exception {
        Principal medecinPrincipal = () -> "medecin@test.com";

        when(formulaireMedecinService.getFormulairePourRemplissage(1L))
                .thenReturn(testFormulaire);

        mockMvc.perform(get("/api/formulaires/recus/1").principal(medecinPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titre").value("Formulaire Test"));
    }

    // ==================== GET /api/formulaires/envoyes ====================

    @Test
    void getFormulairesEnvoyes_ShouldReturnList() throws Exception {
        when(formulaireMedecinService.getFormulairesEnvoyes("chercheur@test.com"))
                .thenReturn(List.of(testFormulaireMedecin));

        mockMvc.perform(get("/api/formulaires/envoyes").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ==================== GET /api/formulaires/{id} ====================

    @Test
    void getFormulaire_ShouldReturnFormulaire() throws Exception {
        when(formulaireService.getFormulaireById(1L)).thenReturn(testFormulaire);

        mockMvc.perform(get("/api/formulaires/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titre").value("Formulaire Test"));
    }

    // ==================== PUT /api/formulaires/{id} ====================

    @Test
    void updateFormulaire_ShouldReturnUpdatedFormulaire() throws Exception {
        FormulaireRequest request = createValidFormulaireRequest("Formulaire modifié", "Étude Modifiée");

        Formulaire updatedFormulaire = new Formulaire();
        updatedFormulaire.setIdFormulaire(1L);
        updatedFormulaire.setTitre("Formulaire modifié");
        updatedFormulaire.setChercheur(chercheur);

        when(formulaireService.updateFormulaire(eq(1L), any(FormulaireRequest.class), eq("chercheur@test.com")))
                .thenReturn(updatedFormulaire);

        mockMvc.perform(put("/api/formulaires/1")
                .principal(mockPrincipal)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titre").value("Formulaire modifié"));
    }

    // ==================== GET /api/formulaires/stats ====================

    @Test
    void getStats_ShouldReturnStats() throws Exception {
        Map<String, Object> stats = Map.of(
                "totalFormulaires", 5,
                "totalReponses", 20
        );

        when(formulaireService.getStatsByUser("chercheur@test.com")).thenReturn(stats);

        mockMvc.perform(get("/api/formulaires/stats").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFormulaires").value(5))
                .andExpect(jsonPath("$.totalReponses").value(20));
    }

    // ==================== DELETE /api/formulaires/{id} ====================

    @Test
    void deleteFormulaire_ShouldReturnNoContent() throws Exception {
        doNothing().when(formulaireService).deleteFormulaire(1L, "chercheur@test.com");

        mockMvc.perform(delete("/api/formulaires/1").principal(mockPrincipal))
                .andExpect(status().isNoContent());
    }

    // ==================== DELETE /api/formulaires/recus/{id} ====================

    @Test
    void masquerPourMedecin_ShouldReturnOk() throws Exception {
        Principal medecinPrincipal = () -> "medecin@test.com";

        doNothing().when(formulaireMedecinService).masquerPourMedecin(1L, "medecin@test.com");

        mockMvc.perform(delete("/api/formulaires/recus/1").principal(medecinPrincipal))
                .andExpect(status().isOk());
    }

    // ==================== DELETE /api/formulaires/envoyes/{id} ====================

    @Test
    void supprimerPourChercheur_ShouldReturnOk() throws Exception {
        doNothing().when(formulaireMedecinService).masquerPourChercheur(1L, "chercheur@test.com");

        mockMvc.perform(delete("/api/formulaires/envoyes/1").principal(mockPrincipal))
                .andExpect(status().isOk());
    }

    // ==================== DELETE /api/formulaires/formulaire-medecin/{id} ====================

    @Test
    void deleteFormulaireMedecin_ShouldReturnNoContent() throws Exception {
        doNothing().when(formulaireMedecinService).supprimerFormulaireMedecin(1L, "chercheur@test.com");

        mockMvc.perform(delete("/api/formulaires/formulaire-medecin/1").principal(mockPrincipal))
                .andExpect(status().isNoContent());
    }
}
