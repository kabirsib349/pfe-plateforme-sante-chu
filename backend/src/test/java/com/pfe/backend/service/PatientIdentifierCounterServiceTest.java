package com.pfe.backend.service;

import com.pfe.backend.model.PatientIdentifierCounter;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.repository.PatientIdentifierCounterRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientIdentifierCounterServiceTest {

    @Mock
    private PatientIdentifierCounterRepository repository;

    @Mock
    private ReponseFormulaireRepository reponseFormulaireRepository;

    @InjectMocks
    private PatientIdentifierCounterService service;

    @Test
    void getNextCounterForFormulaire_ShouldIncrement_WhenCounterExists() {
        // Arrange
        Long formulaireId = 1L;
        PatientIdentifierCounter counter = new PatientIdentifierCounter();
        counter.setFormulaireId(formulaireId);
        counter.setCounter(5);

        when(repository.findByFormulaireIdForUpdate(formulaireId)).thenReturn(Optional.of(counter));
        when(repository.save(any(PatientIdentifierCounter.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        int result = service.getNextCounterForFormulaire(formulaireId);

        // Assert
        assertEquals(6, result);
        assertEquals(6, counter.getCounter());
        verify(repository).save(counter);
    }

    @Test
    void getNextCounterForFormulaire_ShouldInitialize_WhenCounterDoesNotExist() {
        // Arrange
        Long formulaireId = 1L;
        when(repository.findByFormulaireIdForUpdate(formulaireId)).thenReturn(Optional.empty());
        
        // Mock existing responses to calculate max
        ReponseFormulaire r1 = new ReponseFormulaire();
        r1.setPatientIdentifier("ABC-DEF-slug-0010");
        ReponseFormulaire r2 = new ReponseFormulaire();
        r2.setPatientIdentifier("ABC-DEF-slug-0005");
        
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId))
                .thenReturn(List.of(r1, r2));

        when(repository.save(any(PatientIdentifierCounter.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        int result = service.getNextCounterForFormulaire(formulaireId);

        // Assert
        assertEquals(11, result); // Max(10, 5) + 1 = 11
        verify(repository).save(argThat(c -> c.getCounter() == 11 && c.getFormulaireId().equals(formulaireId)));
    }

    @Test
    void getNextCounterForFormulaire_ShouldHandleInvalidIdentifiers() {
        // Arrange
        Long formulaireId = 1L;
        when(repository.findByFormulaireIdForUpdate(formulaireId)).thenReturn(Optional.empty());

        ReponseFormulaire r1 = new ReponseFormulaire();
        r1.setPatientIdentifier(null); // Should be ignored
        ReponseFormulaire r2 = new ReponseFormulaire();
        r2.setPatientIdentifier("INVALID-FORMAT"); // Should be ignored
        ReponseFormulaire r3 = new ReponseFormulaire();
        r3.setPatientIdentifier("VALID-0003"); // Valid

        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId))
                .thenReturn(List.of(r1, r2, r3));

        when(repository.save(any(PatientIdentifierCounter.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        int result = service.getNextCounterForFormulaire(formulaireId);

        // Assert
        assertEquals(4, result); // Max(3) + 1 = 4
    }

    @Test
    void getNextCounterForFormulaire_ShouldStartAtOne_WhenNoResponses() {
        // Arrange
        Long formulaireId = 1L;
        when(repository.findByFormulaireIdForUpdate(formulaireId)).thenReturn(Optional.empty());
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId))
                .thenReturn(Collections.emptyList());
        when(repository.save(any(PatientIdentifierCounter.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        int result = service.getNextCounterForFormulaire(formulaireId);

        // Assert
        assertEquals(1, result); // 0 + 1 = 1
    }
}
