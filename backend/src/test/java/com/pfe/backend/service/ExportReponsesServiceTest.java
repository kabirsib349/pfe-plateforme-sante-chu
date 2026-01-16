package com.pfe.backend.service;

import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.Champ;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.FormulaireRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExportReponsesServiceTest {

    @Mock
    private FormulaireRepository formulaireRepository;

    @Mock
    private ReponseFormulaireRepository reponseFormulaireRepository;

    @InjectMocks
    private ExportReponsesService exportReponsesService;

    @Test
    void exporterReponsesCsv_ShouldReturnCsv_WhenAuthorized() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponse = createReponse(champ, "25", "patient1hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("Patient_ID"));
        assertTrue(content.contains("AGE"));
        assertTrue(content.contains("Date_Saisie"));
    }

    @Test
    void exporterReponsesCsv_ShouldThrowException_WhenFormulaireNotFound() {
        // Arrange
        when(formulaireRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> exportReponsesService.exporterReponsesCsv(999L, "chercheur@test.com"));
    }

    @Test
    void exporterReponsesCsv_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        Long formulaireId = 1L;
        Utilisateur chercheur = createUtilisateur("chercheur@test.com");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(new ArrayList<>());

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> exportReponsesService.exporterReponsesCsv(formulaireId, "other@test.com"));
    }

    @Test
    void exporterReponsesCsv_ShouldThrowException_WhenChercheurIsNull() {
        // Arrange
        Long formulaireId = 1L;

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(null);
        formulaire.setChamps(new ArrayList<>());

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> exportReponsesService.exporterReponsesCsv(formulaireId, "chercheur@test.com"));
    }

    @Test
    void exporterReponsesCsv_ShouldHandleEmptyReponses() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(Collections.emptyList());

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("Patient_ID")); // Header should still be there
    }

    @Test
    void exporterReponsesCsv_ShouldHandleMultiplePatients() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponse1 = createReponse(champ, "25", "patient1hash");
        ReponseFormulaire reponse2 = createReponse(champ, "30", "patient2hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse1, reponse2));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("patient1hash"));
        assertTrue(content.contains("patient2hash"));
    }

    @Test
    void exporterReponsesCsv_ShouldHandleDateSaisie() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponse = createReponse(champ, "25", "patient1hash");
        reponse.setDateSaisie(LocalDateTime.of(2024, 1, 15, 10, 30, 0));

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("2024-01-15"));
    }

    @Test
    void exporterReponsesCsv_ShouldEscapeSpecialCharacters() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Comment");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponse = createReponse(champ, "Value;with;semicolons", "patient1hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("\"Value;with;semicolons\"")); // Should be escaped
    }

    @Test
    void exporterReponsesCsv_ShouldHandleNullLabelInChamp() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel(null); // Null label

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(Collections.emptyList());

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("CHAMP_1")); // Uses default name
    }

    @Test
    void exporterReponsesCsv_ShouldFilterNullPatientHash() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponseWithHash = createReponse(champ, "25", "patient1hash");
        
        ReponseFormulaire reponseWithoutHash = new ReponseFormulaire();
        reponseWithoutHash.setChamp(champ);
        reponseWithoutHash.setValeur("30");
        reponseWithoutHash.setPatientIdentifierHash(null);

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponseWithHash, reponseWithoutHash));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("patient1hash"));
        assertFalse(content.contains("30")); // Response without hash should be filtered
    }

    @Test
    void exporterReponsesCsv_ShouldHandleNullChampInReponse() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponseWithNullChamp = new ReponseFormulaire();
        reponseWithNullChamp.setChamp(null);
        reponseWithNullChamp.setValeur("25");
        reponseWithNullChamp.setPatientIdentifierHash("patient1hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponseWithNullChamp));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
    }

    @Test
    void exporterReponsesCsv_ShouldFindMostRecentDate() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ1 = new Champ();
        champ1.setIdChamp(1L);
        champ1.setLabel("Age");

        Champ champ2 = new Champ();
        champ2.setIdChamp(2L);
        champ2.setLabel("Poids");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ1, champ2));

        ReponseFormulaire reponse1 = createReponse(champ1, "25", "patient1hash");
        reponse1.setDateSaisie(LocalDateTime.of(2024, 1, 10, 10, 0, 0));

        ReponseFormulaire reponse2 = createReponse(champ2, "70", "patient1hash");
        reponse2.setDateSaisie(LocalDateTime.of(2024, 1, 15, 10, 0, 0)); // More recent

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse1, reponse2));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("2024-01-15")); // Most recent date
    }

    private Utilisateur createUtilisateur(String email) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(1L);
        utilisateur.setEmail(email);
        return utilisateur;
    }

    private ReponseFormulaire createReponse(Champ champ, String valeur, String patientHash) {
        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur(valeur);
        reponse.setPatientIdentifierHash(patientHash);
        return reponse;
    }

    @Test
    void exporterReponsesCsv_ShouldHandleOlderDateSaisie() {
        // Arrange - Test case where second date is older (branch: nouvelleDate is NOT after)
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ1 = new Champ();
        champ1.setIdChamp(1L);
        champ1.setLabel("Age");

        Champ champ2 = new Champ();
        champ2.setIdChamp(2L);
        champ2.setLabel("Poids");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ1, champ2));

        ReponseFormulaire reponse1 = createReponse(champ1, "25", "patient1hash");
        reponse1.setDateSaisie(LocalDateTime.of(2024, 1, 15, 10, 0, 0)); // More recent

        ReponseFormulaire reponse2 = createReponse(champ2, "70", "patient1hash");
        reponse2.setDateSaisie(LocalDateTime.of(2024, 1, 10, 10, 0, 0)); // Older

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse1, reponse2));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        // Should use the most recent date (2024-01-15), not the older one
        assertTrue(content.contains("2024-01-15"));
    }

    @Test
    void exporterReponsesCsv_ShouldHandleNullDateSaisie() {
        // Arrange - Test case where dateSaisie is null
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponse = createReponse(champ, "25", "patient1hash");
        reponse.setDateSaisie(null); // Null date

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("patient1hash"));
        assertTrue(content.contains("25"));
    }

    @Test
    void exporterReponsesCsv_ShouldEscapeQuotes() {
        // Arrange - Test escapeCsv with quotes
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Comment");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponse = createReponse(champ, "He said \"hello\"", "patient1hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        // Quotes should be escaped by doubling them
        assertTrue(content.contains("\"\""));
    }

    @Test
    void exporterReponsesCsv_ShouldEscapeNewlines() {
        // Arrange - Test escapeCsv with newlines
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Comment");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponse = createReponse(champ, "Line1\nLine2", "patient1hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        // Value with newline should be quoted
        assertTrue(content.contains("\"Line1\nLine2\""));
    }

    @Test
    void exporterReponsesCsv_ShouldHandleNoMatchingChamp() {
        // Arrange - Response for a champ not in the formulaire's champs list
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ1 = new Champ();
        champ1.setIdChamp(1L);
        champ1.setLabel("Age");

        Champ champ2 = new Champ();
        champ2.setIdChamp(2L);
        champ2.setLabel("Poids");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ1)); // Only champ1

        // Response is for champ2 which is not in the formulaire
        ReponseFormulaire reponse = createReponse(champ2, "70", "patient1hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        // Should have header with Age but no data for it
        assertTrue(content.contains("AGE"));
    }

    @Test
    void exporterReponsesCsv_ShouldHandleSameDateSaisie() {
        // Arrange - Two responses with same date (edge case)
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ1 = new Champ();
        champ1.setIdChamp(1L);
        champ1.setLabel("Age");

        Champ champ2 = new Champ();
        champ2.setIdChamp(2L);
        champ2.setLabel("Poids");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ1, champ2));

        LocalDateTime sameDate = LocalDateTime.of(2024, 1, 15, 10, 0, 0);

        ReponseFormulaire reponse1 = createReponse(champ1, "25", "patient1hash");
        reponse1.setDateSaisie(sameDate);

        ReponseFormulaire reponse2 = createReponse(champ2, "70", "patient1hash");
        reponse2.setDateSaisie(sameDate); // Same date

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse1, reponse2));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("2024-01-15"));
    }

    @Test
    void exporterReponsesCsv_ShouldHandleDuplicateChampsForSamePatient() {
        // Arrange - Tests the merge function (r1, r2) -> r1 in creerMapReponsesParChamp
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        // Two responses for the same champ (same patient)
        ReponseFormulaire reponse1 = createReponse(champ, "25", "patient1hash");
        ReponseFormulaire reponse2 = createReponse(champ, "30", "patient1hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse1, reponse2));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        // Should only contain one of the values (first one)
        assertTrue(content.contains("25"));
    }

    @Test
    void exporterReponsesCsv_ShouldHandleNullValeur() {
        // Arrange - Response with null value
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ = new Champ();
        champ.setIdChamp(1L);
        champ.setLabel("Age");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ));

        ReponseFormulaire reponse = createReponse(champ, null, "patient1hash");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("patient1hash"));
    }

    @Test
    void exporterReponsesCsv_ShouldHandleMixedNullAndNonNullDates() {
        // Arrange - One response with date, one without
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(emailChercheur);

        Champ champ1 = new Champ();
        champ1.setIdChamp(1L);
        champ1.setLabel("Age");

        Champ champ2 = new Champ();
        champ2.setIdChamp(2L);
        champ2.setLabel("Poids");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setChercheur(chercheur);
        formulaire.setChamps(List.of(champ1, champ2));

        ReponseFormulaire reponse1 = createReponse(champ1, "25", "patient1hash");
        reponse1.setDateSaisie(null); // First is null

        ReponseFormulaire reponse2 = createReponse(champ2, "70", "patient1hash");
        reponse2.setDateSaisie(LocalDateTime.of(2024, 1, 15, 10, 0, 0)); // Second has date

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId)).thenReturn(List.of(reponse1, reponse2));

        // Act
        ByteArrayResource result = exportReponsesService.exporterReponsesCsv(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        String content = new String(result.getByteArray());
        assertTrue(content.contains("2024-01-15"));
    }
}
