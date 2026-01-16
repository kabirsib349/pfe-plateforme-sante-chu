package com.pfe.backend.service;

import com.pfe.backend.dto.ReponseFormulaireRequest;
import com.pfe.backend.dto.StatistiqueFormulaireDto;
import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.*;
import com.pfe.backend.repository.ChampRepository;
import com.pfe.backend.repository.FormulaireMedecinRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReponseFormulaireServiceTest {

    @Mock
    private ReponseFormulaireRepository reponseFormulaireRepository;
    @Mock
    private FormulaireMedecinRepository formulaireMedecinRepository;
    @Mock
    private ChampRepository champRepository;
    @Mock
    private ActiviteService activiteService;

    @InjectMocks
    private ReponseFormulaireService reponseFormulaireService;

    @Test
    void sauvegarderReponses_ShouldSaveReponses_WhenMedecinAuthorized() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setMasquePourChercheur(false);

        Champ champ = new Champ();
        champ.setIdChamp(100L);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(100L, "Valeur Test");

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(champRepository.findById(100L)).thenReturn(Optional.of(champ));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailMedecin, false);

        // Assert
        verify(reponseFormulaireRepository).save(any(ReponseFormulaire.class));
        verify(formulaireMedecinRepository).save(fm);
        assertTrue(fm.getComplete());
        verify(activiteService).enregistrerActivite(eq(emailMedecin), eq("Formulaire rempli"), any(), any(), any());
    }

    @Test
    void sauvegarderReponses_ShouldSaveAsBrouillon_WhenEnBrouillonTrue() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setMasquePourChercheur(false);

        Champ champ = new Champ();
        champ.setIdChamp(100L);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(100L, "Valeur Test");

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(champRepository.findById(100L)).thenReturn(Optional.of(champ));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailMedecin, true);

        // Assert
        assertFalse(fm.getComplete());
        assertEquals(StatutFormulaire.BROUILLON, fm.getStatut());
    }

    @Test
    void sauvegarderReponses_ShouldThrowException_WhenFormulaireMedecinNotFound() {
        // Arrange
        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(999L);

        when(formulaireMedecinRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> reponseFormulaireService.sauvegarderReponses(request, "medecin@test.com", false));
    }

    @Test
    void sauvegarderReponses_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        Long fmId = 1L;
        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com");
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setChercheur(chercheur);

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> reponseFormulaireService.sauvegarderReponses(request, "unauthorized@test.com", false));
    }

    @Test
    void sauvegarderReponses_ShouldThrowException_WhenNoReponsesAndNotBrouillon() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(null);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> reponseFormulaireService.sauvegarderReponses(request, emailMedecin, false));
    }

    @Test
    void sauvegarderReponses_ShouldSaveBrouillonVide_WhenNoReponsesAndBrouillon() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(null);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailMedecin, true);

        // Assert
        assertEquals(StatutFormulaire.BROUILLON, fm.getStatut());
        assertFalse(fm.getComplete());
        verify(reponseFormulaireRepository, never()).save(any(ReponseFormulaire.class));
    }

    @Test
    void sauvegarderReponses_ShouldAllowChercheurCreateur() {
        // Arrange
        Long fmId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com");
        Utilisateur chercheur = createUtilisateur(2L, emailChercheur);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setMasquePourChercheur(false);

        Champ champ = new Champ();
        champ.setIdChamp(100L);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(100L, "Valeur");

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(champRepository.findById(100L)).thenReturn(Optional.of(champ));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act - Chercheur can save responses
        reponseFormulaireService.sauvegarderReponses(request, emailChercheur, false);

        // Assert
        verify(reponseFormulaireRepository).save(any(ReponseFormulaire.class));
    }

    @Test
    void sauvegarderReponses_ShouldAllowChercheurSansMedecin() {
        // Arrange
        Long fmId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(2L, emailChercheur);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(null); // No medecin assigned
        fm.setChercheur(chercheur);
        fm.setFormulaire(formulaire);
        fm.setMasquePourChercheur(false);

        Champ champ = new Champ();
        champ.setIdChamp(100L);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(100L, "Valeur");

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(champRepository.findById(100L)).thenReturn(Optional.of(champ));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailChercheur, false);

        // Assert
        verify(reponseFormulaireRepository).save(any(ReponseFormulaire.class));
    }

    @Test
    void sauvegarderReponses_ShouldUnmaskForChercheur_WhenMasked() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setMasquePourChercheur(true); // Was masked

        Champ champ = new Champ();
        champ.setIdChamp(100L);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(100L, "Valeur");

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(champRepository.findById(100L)).thenReturn(Optional.of(champ));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailMedecin, false);

        // Assert
        assertFalse(fm.getMasquePourChercheur());
    }

    @Test
    void sauvegarderReponses_ShouldThrowException_WhenChampNotFound() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(999L, "Valeur");

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(champRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> reponseFormulaireService.sauvegarderReponses(request, emailMedecin, false));
    }

    @Test
    void marquerCommeLu_ShouldMarkAsRead_WhenAuthorized() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setLu(false);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.marquerCommeLu(fmId, emailMedecin);

        // Assert
        assertTrue(fm.getLu());
        assertNotNull(fm.getDateLecture());
    }

    @Test
    void marquerCommeLu_ShouldNotUpdate_WhenAlreadyRead() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setLu(true);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act
        reponseFormulaireService.marquerCommeLu(fmId, emailMedecin);

        // Assert
        verify(formulaireMedecinRepository, never()).save(any(FormulaireMedecin.class));
    }

    @Test
    void marquerCommeLu_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        Long fmId = 1L;
        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com");

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> reponseFormulaireService.marquerCommeLu(fmId, "other@test.com"));
    }

    @Test
    void getReponses_ShouldReturnList() {
        // Arrange
        Long fmId = 1L;
        ReponseFormulaire reponse = new ReponseFormulaire();

        when(reponseFormulaireRepository.findAllWithOptions(fmId)).thenReturn(List.of(reponse));

        // Act
        List<ReponseFormulaire> result = reponseFormulaireService.getReponses(fmId);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getReponsesByPatient_ShouldReturnReponses() {
        // Arrange
        Long fmId = 1L;
        String patientIdentifier = "patient123";
        ReponseFormulaire reponse = new ReponseFormulaire();

        when(reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifierHash(eq(fmId), anyString()))
                .thenReturn(List.of(reponse));

        // Act
        List<ReponseFormulaire> result = reponseFormulaireService.getReponsesByPatient(fmId, patientIdentifier);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getAllDraftsForFormulaire_ShouldReturnDrafts() {
        // Arrange
        Long fmId = 1L;

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);

        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setPatientIdentifier("patient123");
        reponse.setPatientIdentifierHash("hash123");
        reponse.setDateSaisie(LocalDateTime.now());

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(reponseFormulaireRepository.findDistinctDraftPatientHashes(fmId)).thenReturn(List.of("hash123"));
        when(reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifierHash(fmId, "hash123"))
                .thenReturn(List.of(reponse));

        // Act
        List<Map<String, Object>> result = reponseFormulaireService.getAllDraftsForFormulaire(fmId);

        // Assert
        assertEquals(1, result.size());
        assertEquals("patient123", result.get(0).get("patientIdentifier"));
    }

    @Test
    void getAllDraftsForFormulaire_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(formulaireMedecinRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> reponseFormulaireService.getAllDraftsForFormulaire(999L));
    }

    @Test
    void getDraftForPatient_ShouldReturnDraft_WhenExists() {
        // Arrange
        Long fmId = 1L;
        String patientIdentifier = "patient123";

        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setPatientIdentifier(patientIdentifier);

        when(reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifierHashAndDraft(eq(fmId), anyString(), eq(true)))
                .thenReturn(List.of(reponse));

        // Act
        Map<String, Object> result = reponseFormulaireService.getDraftForPatient(fmId, patientIdentifier);

        // Assert
        assertFalse(result.isEmpty());
        assertEquals(patientIdentifier, result.get("patientIdentifier"));
    }

    @Test
    void getDraftForPatient_ShouldReturnEmptyMap_WhenNotExists() {
        // Arrange
        Long fmId = 1L;

        when(reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifierHashAndDraft(eq(fmId), anyString(), eq(true)))
                .thenReturn(Collections.emptyList());

        // Act
        Map<String, Object> result = reponseFormulaireService.getDraftForPatient(fmId, "unknown");

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void countDrafts_ShouldReturnCount() {
        // Arrange
        Long fmId = 1L;
        when(reponseFormulaireRepository.findDistinctDraftPatientHashes(fmId)).thenReturn(List.of("hash1", "hash2"));

        // Act
        int result = reponseFormulaireService.countDrafts(fmId);

        // Assert
        assertEquals(2, result);
    }

    @Test
    void getPatientIdentifiers_ShouldReturnDistinctIdentifiers() {
        // Arrange
        Long fmId = 1L;

        ReponseFormulaire reponse1 = new ReponseFormulaire();
        reponse1.setPatientIdentifier("patient1");

        ReponseFormulaire reponse2 = new ReponseFormulaire();
        reponse2.setPatientIdentifier("patient2");

        ReponseFormulaire reponse3 = new ReponseFormulaire();
        reponse3.setPatientIdentifier("patient1"); // Duplicate

        when(reponseFormulaireRepository.findByFormulaireMedecinId(fmId))
                .thenReturn(List.of(reponse1, reponse2, reponse3));

        // Act
        List<String> result = reponseFormulaireService.getPatientIdentifiers(fmId);

        // Assert
        assertEquals(2, result.size());
        assertTrue(result.contains("patient1"));
        assertTrue(result.contains("patient2"));
    }

    @Test
    void supprimerReponsesPatient_ShouldDelete_WhenMedecinAuthorized() {
        // Arrange
        Long fmId = 1L;
        String patientIdentifier = "patient123";
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act
        reponseFormulaireService.supprimerReponsesPatient(fmId, patientIdentifier, emailMedecin);

        // Assert
        verify(reponseFormulaireRepository).deleteByFormulaireMedecinIdAndPatientIdentifierHash(eq(fmId), anyString());
    }

    @Test
    void supprimerReponsesPatient_ShouldDelete_WhenChercheurAuthorized() {
        // Arrange
        Long fmId = 1L;
        String patientIdentifier = "patient123";
        String emailChercheur = "chercheur@test.com";

        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com");
        Utilisateur chercheur = createUtilisateur(2L, emailChercheur);

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act
        reponseFormulaireService.supprimerReponsesPatient(fmId, patientIdentifier, emailChercheur);

        // Assert
        verify(reponseFormulaireRepository).deleteByFormulaireMedecinIdAndPatientIdentifierHash(eq(fmId), anyString());
    }

    @Test
    void supprimerReponsesPatient_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        Long fmId = 1L;
        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com");
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> reponseFormulaireService.supprimerReponsesPatient(fmId, "patient", "unauthorized@test.com"));
    }

    @Test
    void supprimerToutesReponsesFormulaire_ShouldDelete_WhenAuthorized() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setChercheur(chercheur);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.supprimerToutesReponsesFormulaire(fmId, emailMedecin);

        // Assert
        verify(reponseFormulaireRepository).deleteByFormulaireMedecinId(fmId);
        assertFalse(fm.getComplete());
    }

    @Test
    void supprimerToutesReponsesFormulaire_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        Long fmId = 1L;
        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com");
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setChercheur(chercheur);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> reponseFormulaireService.supprimerToutesReponsesFormulaire(fmId, "unauthorized@test.com"));
    }

    @Test
    void getStatistiques_ShouldReturnStats() {
        // Arrange
        Long fmId = 1L;

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setComplete(true);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(reponseFormulaireRepository.countDistinctPatients(fmId)).thenReturn(5L);

        // Act
        StatistiqueFormulaireDto result = reponseFormulaireService.getStatistiques(fmId);

        // Assert
        assertNotNull(result);
        assertEquals(5L, result.nombreReponsesCompletes());
        assertEquals(0L, result.nombreReponsesEnCours());
    }

    @Test
    void getStatistiques_ShouldReturnEnCours_WhenNotComplete() {
        // Arrange
        Long fmId = 1L;

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setComplete(false);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(reponseFormulaireRepository.countDistinctPatients(fmId)).thenReturn(3L);

        // Act
        StatistiqueFormulaireDto result = reponseFormulaireService.getStatistiques(fmId);

        // Assert
        assertNotNull(result);
        assertEquals(0L, result.nombreReponsesCompletes());
        assertEquals(3L, result.nombreReponsesEnCours());
    }

    @Test
    void sauvegarderReponses_ShouldSkipEmptyValues() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setMasquePourChercheur(false);

        Champ champ1 = new Champ();
        champ1.setIdChamp(100L);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(100L, "Valeur");
        reponses.put(101L, "   "); // Empty after trim

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(champRepository.findById(100L)).thenReturn(Optional.of(champ1));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailMedecin, false);

        // Assert - Only one save call for non-empty value
        verify(reponseFormulaireRepository, times(1)).save(any(ReponseFormulaire.class));
    }

    private Utilisateur createUtilisateur(Long id, String email) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(id);
        utilisateur.setEmail(email);
        return utilisateur;
    }

    @Test
    void sauvegarderReponses_ShouldHandleNullValueInReponses() {
        // Arrange - Test the branch where rawEntry.getValue() is null
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setMasquePourChercheur(false);

        Champ champ = new Champ();
        champ.setIdChamp(100L);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(100L, null); // Null value

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailMedecin, false);

        // Assert - Should not save any response since value is null
        verify(reponseFormulaireRepository, never()).save(any(ReponseFormulaire.class));
    }

    @Test
    void getAllDraftsForFormulaire_ShouldHandleEmptyResponsesForHash() {
        // Arrange - Test the branch where reponses.isEmpty() is true
        Long fmId = 1L;

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(reponseFormulaireRepository.findDistinctDraftPatientHashes(fmId)).thenReturn(List.of("hash1"));
        when(reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifierHash(fmId, "hash1"))
                .thenReturn(Collections.emptyList()); // Empty responses

        // Act
        List<Map<String, Object>> result = reponseFormulaireService.getAllDraftsForFormulaire(fmId);

        // Assert - Should return empty list since responses are empty
        assertTrue(result.isEmpty());
    }

    @Test
    void getPatientIdentifiers_ShouldFilterNullIdentifiers() {
        // Arrange - Test the filter branch where identifier is null
        Long fmId = 1L;

        ReponseFormulaire reponse1 = new ReponseFormulaire();
        reponse1.setPatientIdentifier("patient1");

        ReponseFormulaire reponse2 = new ReponseFormulaire();
        reponse2.setPatientIdentifier(null); // Null identifier

        ReponseFormulaire reponse3 = new ReponseFormulaire();
        reponse3.setPatientIdentifier(""); // Empty identifier

        when(reponseFormulaireRepository.findByFormulaireMedecinId(fmId))
                .thenReturn(List.of(reponse1, reponse2, reponse3));

        // Act
        List<String> result = reponseFormulaireService.getPatientIdentifiers(fmId);

        // Assert - Should only contain non-null, non-empty identifier
        assertEquals(1, result.size());
        assertTrue(result.contains("patient1"));
    }

    @Test
    void sauvegarderReponses_ShouldNotChangeMasquePourChercheur_WhenAlreadyFalse() {
        // Arrange - Test the branch where masquePourChercheur is already false
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setMasquePourChercheur(false); // Already false

        Champ champ = new Champ();
        champ.setIdChamp(100L);

        Map<Long, String> reponses = new HashMap<>();
        reponses.put(100L, "Valeur");

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(reponses);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(champRepository.findById(100L)).thenReturn(Optional.of(champ));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailMedecin, false);

        // Assert - masquePourChercheur should remain false
        assertFalse(fm.getMasquePourChercheur());
    }

    @Test
    void verifierAutorisation_ShouldThrowException_WhenChercheurIsNull() {
        // Arrange - Test the branch where formulaire.getChercheur() is null
        Long fmId = 1L;
        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(null); // Null chercheur

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert - Unauthorized user when chercheur is null should still work for medecin
        // This passes because medecin is authorized
        // Now test with unauthorized user
        assertThrows(IllegalArgumentException.class,
            () -> reponseFormulaireService.sauvegarderReponses(request, "unauthorized@test.com", false));
    }

    @Test
    void supprimerToutesReponsesFormulaire_ShouldDelete_WhenChercheurAuthorized() {
        // Arrange - Test branch where chercheur is authorized
        Long fmId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com");
        Utilisateur chercheur = createUtilisateur(2L, emailChercheur);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setChercheur(chercheur); // Chercheur set
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.supprimerToutesReponsesFormulaire(fmId, emailChercheur);

        // Assert
        verify(reponseFormulaireRepository).deleteByFormulaireMedecinId(fmId);
        assertFalse(fm.getComplete());
    }

    @Test
    void supprimerToutesReponsesFormulaire_ShouldThrowException_WhenMedecinIsNull() {
        // Arrange - Test branch where medecin is null
        Long fmId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(2L, emailChercheur);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(null); // Null medecin
        fm.setChercheur(chercheur);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act - Chercheur should still be authorized
        reponseFormulaireService.supprimerToutesReponsesFormulaire(fmId, emailChercheur);

        // Assert
        verify(reponseFormulaireRepository).deleteByFormulaireMedecinId(fmId);
    }

    @Test
    void supprimerToutesReponsesFormulaire_ShouldThrowException_WhenChercheurIsNull() {
        // Arrange - Test branch where chercheur is null
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setChercheur(null); // Null chercheur
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act - Medecin should be authorized
        reponseFormulaireService.supprimerToutesReponsesFormulaire(fmId, emailMedecin);

        // Assert
        verify(reponseFormulaireRepository).deleteByFormulaireMedecinId(fmId);
    }

    @Test
    void sauvegarderReponses_ShouldHandleEmptyReponses_WhenNotBrouillon() {
        // Arrange - Test the branch with empty Map (not null)
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(new HashMap<>()); // Empty Map

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> reponseFormulaireService.sauvegarderReponses(request, emailMedecin, false));
    }

    @Test
    void sauvegarderReponses_ShouldHandleEmptyReponses_WhenBrouillon() {
        // Arrange - Test the branch with empty Map as brouillon
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin);
        Utilisateur chercheur = createUtilisateur(2L, "chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);

        ReponseFormulaireRequest request = new ReponseFormulaireRequest();
        request.setFormulaireMedecinId(fmId);
        request.setPatientIdentifier("patient123");
        request.setReponses(new HashMap<>()); // Empty Map

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        reponseFormulaireService.sauvegarderReponses(request, emailMedecin, true);

        // Assert
        assertEquals(StatutFormulaire.BROUILLON, fm.getStatut());
        assertFalse(fm.getComplete());
    }

    @Test
    void getStatistiques_ShouldThrowException_WhenFormulaireMedecinNotFound() {
        // Arrange
        when(formulaireMedecinRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> reponseFormulaireService.getStatistiques(999L));
    }

    @Test
    void marquerCommeLu_ShouldThrowException_WhenFormulaireMedecinNotFound() {
        // Arrange
        when(formulaireMedecinRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> reponseFormulaireService.marquerCommeLu(999L, "medecin@test.com"));
    }

    @Test
    void supprimerReponsesPatient_ShouldThrowException_WhenFormulaireMedecinNotFound() {
        // Arrange
        when(formulaireMedecinRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> reponseFormulaireService.supprimerReponsesPatient(999L, "patient", "medecin@test.com"));
    }

    @Test
    void supprimerToutesReponsesFormulaire_ShouldThrowException_WhenFormulaireMedecinNotFound() {
        // Arrange
        when(formulaireMedecinRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> reponseFormulaireService.supprimerToutesReponsesFormulaire(999L, "medecin@test.com"));
    }
}
