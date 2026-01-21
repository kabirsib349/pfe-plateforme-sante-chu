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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientIdentifierCounterInitializerTest {

    @Mock
    private ReponseFormulaireRepository reponseFormulaireRepository;

    @Mock
    private PatientIdentifierCounterRepository counterRepository;

    @InjectMocks
    private PatientIdentifierCounterInitializer initializer;

    @Test
    void run_ShouldInitializeCounters_WhenTheyDoNotExist() {
        // Arrange
        Long fid1 = 1L;
        Long fid2 = 2L;
        
        when(reponseFormulaireRepository.findDistinctFormulaireIds()).thenReturn(List.of(fid1, fid2));
        
        // Formulaire 1: Counter missing, has responses
        when(counterRepository.findByFormulaireId(fid1)).thenReturn(Optional.empty());
        ReponseFormulaire r1 = new ReponseFormulaire();
        r1.setPatientIdentifier("ABC-0010");
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(fid1)).thenReturn(List.of(r1));

        // Formulaire 2: Counter missing, no responses
        when(counterRepository.findByFormulaireId(fid2)).thenReturn(Optional.empty());
        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(fid2)).thenReturn(Collections.emptyList());

        // Act
        initializer.run();

        // Assert
        // Should create counter for fid1 with 11
        verify(counterRepository).save(argThat(c -> c.getFormulaireId().equals(fid1) && c.getCounter() == 11));
        
        // Should create counter for fid2 with 1
        verify(counterRepository).save(argThat(c -> c.getFormulaireId().equals(fid2) && c.getCounter() == 1));
    }

    @Test
    void run_ShouldSkip_WhenCounterExists() {
        // Arrange
        Long fid = 1L;
        when(reponseFormulaireRepository.findDistinctFormulaireIds()).thenReturn(List.of(fid));
        when(counterRepository.findByFormulaireId(fid)).thenReturn(Optional.of(new PatientIdentifierCounter()));

        // Act
        initializer.run();

        // Assert
        verify(counterRepository, never()).save(any());
        verify(reponseFormulaireRepository, never()).findByFormulaireIdWithChamp(any());
    }

    @Test
    void run_ShouldHandleInvalidIdentifiers_DuringInitialization() {
        // Arrange
        Long fid = 1L;
        when(reponseFormulaireRepository.findDistinctFormulaireIds()).thenReturn(List.of(fid));
        when(counterRepository.findByFormulaireId(fid)).thenReturn(Optional.empty());

        ReponseFormulaire r1 = new ReponseFormulaire();
        r1.setPatientIdentifier(null);
        ReponseFormulaire r2 = new ReponseFormulaire();
        r2.setPatientIdentifier("INVALID");
        ReponseFormulaire r3 = new ReponseFormulaire();
        r3.setPatientIdentifier("VALID-0005");

        when(reponseFormulaireRepository.findByFormulaireIdWithChamp(fid)).thenReturn(List.of(r1, r2, r3));

        // Act
        initializer.run();

        // Assert
        verify(counterRepository).save(argThat(c -> c.getCounter() == 6));
    }
}
