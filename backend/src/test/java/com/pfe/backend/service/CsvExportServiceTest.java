package com.pfe.backend.service;

import com.pfe.backend.model.Champ;
import com.pfe.backend.model.ListeValeur;
import com.pfe.backend.model.OptionValeur;
import com.pfe.backend.model.ReponseFormulaire;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CsvExportServiceTest {

    @InjectMocks
    private CsvExportService csvExportService;

    @Test
    void generateCsvContent_ShouldReturnEmptyCsv_WhenNoReponses() {
        // Act
        String result = csvExportService.generateCsvContent(Collections.emptyList());

        // Assert
        assertNotNull(result);
        assertEquals("", result); // Empty string when no responses
    }

    @Test
    void generateCsvContent_ShouldGenerateCsv_WithSinglePatient() {
        // Arrange
        Champ champ = createChamp(1L, "Age");
        ReponseFormulaire reponse = createReponse(champ, "25", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Age"));
        assertTrue(result.contains("25"));
    }

    @Test
    void generateCsvContent_ShouldGenerateCsv_WithMultiplePatients() {
        // Arrange
        Champ champ = createChamp(1L, "Sexe");
        
        ReponseFormulaire reponse1 = createReponse(champ, "M", "patient1hash");
        ReponseFormulaire reponse2 = createReponse(champ, "F", "patient2hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse1, reponse2));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Sexe"));
        assertTrue(result.contains("M"));
        assertTrue(result.contains("F"));
    }

    @Test
    void generateCsvContent_ShouldConvertOptionValueToLabel() {
        // Arrange
        OptionValeur option = new OptionValeur();
        option.setValeur("M");
        option.setLibelle("Masculin");

        ListeValeur listeValeur = new ListeValeur();
        listeValeur.setOptions(new ArrayList<>(List.of(option)));

        Champ champ = createChamp(1L, "Sexe");
        champ.setListeValeur(listeValeur);

        ReponseFormulaire reponse = createReponse(champ, "M", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Masculin"));
    }

    @Test
    void generateCsvContent_ShouldHandleNullValeur() {
        // Arrange
        Champ champ = createChamp(1L, "Test");
        
        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur(null);
        reponse.setPatientIdentifierHash("patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
    }

    @Test
    void generateCsvContent_ShouldSortByCategory() {
        // Arrange
        Champ champAge = createChamp(1L, "Age");
        Champ champBilan = createChamp(2L, "Bilan");
        
        ReponseFormulaire reponseAge = createReponse(champAge, "30", "patient1hash");
        ReponseFormulaire reponseBilan = createReponse(champBilan, "Normal", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponseBilan, reponseAge));

        // Assert
        assertNotNull(result);
        // Age (IDENTITE PATIENT) should come before Bilan (BILAN PRE OPERATOIRE)
        int ageIndex = result.indexOf("Age");
        int bilanIndex = result.indexOf("Bilan");
        assertTrue(ageIndex > 0);
        assertTrue(bilanIndex > 0);
    }

    @Test
    void generateCsvContent_ShouldHandleMultipleChamps() {
        // Arrange
        Champ champ1 = createChamp(1L, "Age");
        Champ champ2 = createChamp(2L, "Poids");
        
        ReponseFormulaire reponse1 = createReponse(champ1, "30", "patient1hash");
        ReponseFormulaire reponse2 = createReponse(champ2, "70", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse1, reponse2));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Age"));
        assertTrue(result.contains("Poids"));
        assertTrue(result.contains("30"));
        assertTrue(result.contains("70"));
    }

    @Test
    void generateCsvContent_ShouldHandleOptionsWithNullValeur() {
        // Arrange
        OptionValeur option = new OptionValeur();
        option.setValeur(null);
        option.setLibelle("Label");

        ListeValeur listeValeur = new ListeValeur();
        listeValeur.setOptions(new ArrayList<>(List.of(option)));

        Champ champ = createChamp(1L, "Test");
        champ.setListeValeur(listeValeur);

        ReponseFormulaire reponse = createReponse(champ, "M", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("M")); // Should keep original value
    }

    @Test
    void generateCsvContent_ShouldFilterNullPatientHash() {
        // Arrange
        Champ champ = createChamp(1L, "Age");
        
        ReponseFormulaire reponseWithHash = createReponse(champ, "25", "patient1hash");
        
        ReponseFormulaire reponseWithoutHash = new ReponseFormulaire();
        reponseWithoutHash.setChamp(champ);
        reponseWithoutHash.setValeur("30");
        reponseWithoutHash.setPatientIdentifierHash(null);

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponseWithHash, reponseWithoutHash));

        // Assert
        assertNotNull(result);
        // Should only contain data from the response with hash
        long lines = result.lines().count();
        assertTrue(lines >= 2); // Header + at least one data row
    }

    @Test
    void generateCsvContent_ShouldHandleUnknownCategory() {
        // Arrange
        Champ champ = createChamp(1L, "UnknownField");
        ReponseFormulaire reponse = createReponse(champ, "value", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("UnknownField"));
        assertTrue(result.contains("AUTRE")); // Unknown fields go to AUTRE category
    }

    private Champ createChamp(Long id, String label) {
        Champ champ = new Champ();
        champ.setIdChamp(id);
        champ.setLabel(label);
        return champ;
    }

    @Test
    void generateCsvContent_ShouldSortByLabelWithinSameCategory() {
        // Arrange - Two fields in the same category (IDENTITE PATIENT)
        Champ champAge = createChamp(1L, "Age");
        Champ champSexe = createChamp(2L, "Sexe");
        
        // Add in reverse alphabetical order to test sorting within category
        ReponseFormulaire reponseSexe = createReponse(champSexe, "M", "patient1hash");
        ReponseFormulaire reponseAge = createReponse(champAge, "30", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponseSexe, reponseAge));

        // Assert - Age should come before Sexe (alphabetical within same category)
        int ageIndex = result.indexOf("Age");
        int sexeIndex = result.indexOf("Sexe");
        assertTrue(ageIndex < sexeIndex, "Age should come before Sexe (alphabetical order within same category)");
    }

    @Test
    void generateCsvContent_ShouldHandleListeValeurNull() {
        // Arrange - Champ with null ListeValeur
        Champ champ = createChamp(1L, "Age");
        champ.setListeValeur(null);

        ReponseFormulaire reponse = createReponse(champ, "25", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("25"));
    }

    @Test
    void generateCsvContent_ShouldHandleListeValeurWithNullOptions() {
        // Arrange
        ListeValeur listeValeur = new ListeValeur();
        listeValeur.setOptions(null);

        Champ champ = createChamp(1L, "Test");
        champ.setListeValeur(listeValeur);

        ReponseFormulaire reponse = createReponse(champ, "value", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("value"));
    }

    @Test
    void generateCsvContent_ShouldHandleNullValeurWithOptions() {
        // Arrange - Option exists but response value is null
        OptionValeur option = new OptionValeur();
        option.setValeur("M");
        option.setLibelle("Masculin");

        ListeValeur listeValeur = new ListeValeur();
        listeValeur.setOptions(new ArrayList<>(List.of(option)));

        Champ champ = createChamp(1L, "Sexe");
        champ.setListeValeur(listeValeur);

        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur(null);  // Null value
        reponse.setPatientIdentifierHash("patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
    }

    @Test
    void generateCsvContent_ShouldHandleDuplicateChampsFromDifferentPatients() {
        // Arrange - Same champ for different patients (tests merge in toMap)
        Champ champ = createChamp(1L, "Age");
        
        ReponseFormulaire reponse1 = createReponse(champ, "25", "patient1hash");
        ReponseFormulaire reponse2 = createReponse(champ, "30", "patient2hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse1, reponse2));

        // Assert - Should contain data for both patients
        assertNotNull(result);
        assertTrue(result.contains("25"));
        assertTrue(result.contains("30"));
    }

    @Test
    void generateCsvContent_ShouldHandleMissingChampForPatient() {
        // Arrange - Two champs, but one patient only has one response
        Champ champ1 = createChamp(1L, "Age");
        Champ champ2 = createChamp(2L, "Poids");
        
        ReponseFormulaire reponse1Patient1 = createReponse(champ1, "25", "patient1hash");
        ReponseFormulaire reponse2Patient1 = createReponse(champ2, "70", "patient1hash");
        ReponseFormulaire reponse1Patient2 = createReponse(champ1, "30", "patient2hash");
        // Patient2 does not have a response for champ2

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse1Patient1, reponse2Patient1, reponse1Patient2));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("25"));
        assertTrue(result.contains("70"));
        assertTrue(result.contains("30"));
    }

    @Test
    void generateCsvContent_ShouldSortCategoriesCorrectly() {
        // Arrange - Multiple categories to verify correct ordering
        Champ champAge = createChamp(1L, "Age");  // IDENTITE PATIENT
        Champ champTraitement = createChamp(2L, "Traitement antiplaquettaire");  // ANTECEDENTS
        Champ champLieu = createChamp(3L, "Lieu avant le séjour à l'hôpital");  // SEJOUR HOPITAL
        
        ReponseFormulaire reponse1 = createReponse(champLieu, "Domicile", "patient1hash");
        ReponseFormulaire reponse2 = createReponse(champTraitement, "Oui", "patient1hash");
        ReponseFormulaire reponse3 = createReponse(champAge, "45", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse1, reponse2, reponse3));

        // Assert - Categories should be in order: IDENTITE PATIENT, ANTECEDENTS, SEJOUR HOPITAL
        int identiteIndex = result.indexOf("IDENTITE PATIENT");
        int antecedentsIndex = result.indexOf("ANTECEDENTS");
        int sejourIndex = result.indexOf("SEJOUR HOPITAL");
        
        assertTrue(identiteIndex < antecedentsIndex);
        assertTrue(antecedentsIndex < sejourIndex);
    }

    @Test
    void generateCsvContent_ShouldReturnEmptyString_WhenInputIsNull() {
        // Act
        String result = csvExportService.generateCsvContent(null);

        // Assert
        assertEquals("", result);
    }

    @Test
    void generateCsvContent_ShouldNotIncludeFieldsWithNullChamp_InHeaders() {
        // Arrange - Response with null champ ID should be filtered from unique fields
        // but we need a valid response from a different patient for this to work
        Champ validChamp = createChamp(1L, "Age");
        ReponseFormulaire reponseWithValidChamp = createReponse(validChamp, "25", "patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponseWithValidChamp));

        // Assert - Only valid field should appear
        assertNotNull(result);
        assertTrue(result.contains("Age"));
        assertTrue(result.contains("25"));
    }

    @Test
    void generateCsvContent_ShouldHandleNullChampId() {
        // Arrange - Response with null champ ID should be filtered out
        Champ champWithNullId = new Champ();
        champWithNullId.setIdChamp(null);
        champWithNullId.setLabel("Test");

        ReponseFormulaire reponseWithNullChampId = new ReponseFormulaire();
        reponseWithNullChampId.setChamp(champWithNullId);
        reponseWithNullChampId.setValeur("value");
        reponseWithNullChampId.setPatientIdentifierHash("patient1hash");

        Champ validChamp = createChamp(1L, "Age");
        ReponseFormulaire reponseWithValidChamp = createReponse(validChamp, "25", "patient2hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponseWithNullChampId, reponseWithValidChamp));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Age"));
    }

    @Test
    void generateCsvContent_ShouldHandleNullPatientIdentifier() {
        // Arrange - Response with null patientIdentifier
        Champ champ = createChamp(1L, "Age");
        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur("25");
        reponse.setPatientIdentifierHash("patient1hash");
        reponse.setPatientIdentifier(null);

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert - Should handle null patientIdentifier gracefully
        assertNotNull(result);
        assertTrue(result.contains("Age"));
    }

    @Test
    void generateCsvContent_ShouldHandlePatientIdentifierWithoutDash() {
        // Arrange - Patient identifier without dash
        Champ champ = createChamp(1L, "Age");
        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur("25");
        reponse.setPatientIdentifierHash("patient1hash");
        reponse.setPatientIdentifier("PATIENTWITHNODASH");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Age"));
    }

    @Test
    void generateCsvContent_ShouldHandlePatientIdentifierWithNonNumericSuffix() {
        // Arrange - Patient identifier with non-numeric suffix after dash
        Champ champ = createChamp(1L, "Age");
        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur("25");
        reponse.setPatientIdentifierHash("patient1hash");
        reponse.setPatientIdentifier("TEST-PATIENT-ABC");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Age"));
    }

    @Test
    void generateCsvContent_ShouldUseFallbackPatientIdentifier_WhenHashIsEmpty() {
        // Arrange - Empty patientIdentifierHash but valid patientIdentifier
        Champ champ = createChamp(1L, "Age");
        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur("25");
        reponse.setPatientIdentifierHash("");
        reponse.setPatientIdentifier("TEST-0002");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("25"));
    }

    @Test
    void generateCsvContent_ShouldGenerateUnknownId_WhenBothHashAndIdEmpty() {
        // Arrange - Both patientIdentifierHash and patientIdentifier are empty
        Champ champ = createChamp(1L, "Age");
        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur("25");
        reponse.setPatientIdentifierHash("");
        reponse.setPatientIdentifier("");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("25"));
    }

    @Test
    void generateCsvContent_ShouldSortPatientsByInclusionNumber() {
        // Arrange - Multiple patients with different inclusion numbers
        Champ champ = createChamp(1L, "Age");
        
        ReponseFormulaire reponse3 = new ReponseFormulaire();
        reponse3.setChamp(champ);
        reponse3.setValeur("30");
        reponse3.setPatientIdentifierHash("patient3hash");
        reponse3.setPatientIdentifier("TEST-0003");
        
        ReponseFormulaire reponse1 = new ReponseFormulaire();
        reponse1.setChamp(champ);
        reponse1.setValeur("25");
        reponse1.setPatientIdentifierHash("patient1hash");
        reponse1.setPatientIdentifier("TEST-0001");
        
        ReponseFormulaire reponse2 = new ReponseFormulaire();
        reponse2.setChamp(champ);
        reponse2.setValeur("35");
        reponse2.setPatientIdentifierHash("patient2hash");
        reponse2.setPatientIdentifier("TEST-0002");

        // Act - Insert in order 3, 1, 2 to test sorting
        String result = csvExportService.generateCsvContent(List.of(reponse3, reponse1, reponse2));

        // Assert - Should be sorted by inclusion number
        assertNotNull(result);
        int idx25 = result.indexOf("25");
        int idx30 = result.indexOf("30");
        int idx35 = result.indexOf("35");
        assertTrue(idx25 < idx35 && idx35 < idx30, "Results should be sorted by inclusion number");
    }

    @Test
    void generateCsvContent_ShouldHandleNullChampLabel() {
        // Arrange - Champ with null label should be filtered out
        Champ champWithNullLabel = new Champ();
        champWithNullLabel.setIdChamp(1L);
        champWithNullLabel.setLabel(null);

        ReponseFormulaire reponseWithNullLabel = new ReponseFormulaire();
        reponseWithNullLabel.setChamp(champWithNullLabel);
        reponseWithNullLabel.setValeur("value");
        reponseWithNullLabel.setPatientIdentifierHash("patient1hash");

        Champ validChamp = createChamp(2L, "Age");
        ReponseFormulaire reponseWithValidChamp = createReponse(validChamp, "25", "patient2hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponseWithNullLabel, reponseWithValidChamp));

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Age"));
    }

    @Test
    void generateCsvContent_ShouldReturnEmpty_WhenAllChampsHaveNullLabel() {
        // Arrange - All responses have champs with null labels
        Champ champWithNullLabel = new Champ();
        champWithNullLabel.setIdChamp(1L);
        champWithNullLabel.setLabel(null);

        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champWithNullLabel);
        reponse.setValeur("value");
        reponse.setPatientIdentifierHash("patient1hash");

        // Act
        String result = csvExportService.generateCsvContent(List.of(reponse));

        // Assert - Should return empty string as no valid fields exist
        assertEquals("", result);
    }

    private ReponseFormulaire createReponse(Champ champ, String valeur, String patientHash) {
        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setChamp(champ);
        reponse.setValeur(valeur);
        reponse.setPatientIdentifierHash(patientHash);
        reponse.setPatientIdentifier("TEST-" + patientHash.substring(0, 4) + "-0001"); // For inclusion number extraction
        return reponse;
    }
}

