package com.pfe.backend.service;

import com.pfe.backend.model.Activite;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.ActiviteRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActiviteServiceTest {

    @Mock
    private ActiviteRepository activiteRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private ActiviteService activiteService;

    @Test
    void enregistrerActivite_ShouldSaveActivite_WhenUserExists() {
        // Arrange
        String email = "test@example.com";
        String action = "Création de formulaire";
        String ressourceType = "Formulaire";
        Long ressourceId = 1L;
        String details = "Formulaire 'Test' créé";

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(1L);
        utilisateur.setEmail(email);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(utilisateur));
        when(activiteRepository.save(any(Activite.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        activiteService.enregistrerActivite(email, action, ressourceType, ressourceId, details);

        // Assert
        ArgumentCaptor<Activite> activiteCaptor = ArgumentCaptor.forClass(Activite.class);
        verify(activiteRepository).save(activiteCaptor.capture());

        Activite savedActivite = activiteCaptor.getValue();
        assertEquals(utilisateur, savedActivite.getUtilisateur());
        assertEquals(action, savedActivite.getAction());
        assertEquals(ressourceType, savedActivite.getRessourceType());
        assertEquals(ressourceId, savedActivite.getRessourceId());
        assertEquals(details, savedActivite.getDetails());
    }

    @Test
    void enregistrerActivite_ShouldNotSave_WhenUserNotFound() {
        // Arrange
        String email = "unknown@example.com";

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        activiteService.enregistrerActivite(email, "Action", "Type", 1L, "Details");

        // Assert
        verify(activiteRepository, never()).save(any(Activite.class));
    }

    @Test
    void enregistrerActivite_ShouldHandleNullDetails() {
        // Arrange
        String email = "test@example.com";
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setEmail(email);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(utilisateur));
        when(activiteRepository.save(any(Activite.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        activiteService.enregistrerActivite(email, "Action", "Type", 1L, null);

        // Assert
        ArgumentCaptor<Activite> activiteCaptor = ArgumentCaptor.forClass(Activite.class);
        verify(activiteRepository).save(activiteCaptor.capture());
        assertNull(activiteCaptor.getValue().getDetails());
    }
}
