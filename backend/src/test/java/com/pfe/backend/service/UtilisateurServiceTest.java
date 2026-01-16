package com.pfe.backend.service;

import com.pfe.backend.dto.UtilisateurDto;
import com.pfe.backend.model.Role;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UtilisateurServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private UtilisateurService utilisateurService;

    @Test
    void getUtilisateurById_ShouldReturnUtilisateur_WhenFound() {
        // Arrange
        Long id = 1L;
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(id);
        utilisateur.setNom("Test User");
        utilisateur.setEmail("test@example.com");

        when(utilisateurRepository.findById(id)).thenReturn(Optional.of(utilisateur));

        // Act
        Utilisateur result = utilisateurService.getUtilisateurById(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getId());
        assertEquals("Test User", result.getNom());
    }

    @Test
    void getUtilisateurById_ShouldThrowException_WhenNotFound() {
        // Arrange
        Long id = 999L;
        when(utilisateurRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        NoSuchElementException exception = assertThrows(NoSuchElementException.class, 
            () -> utilisateurService.getUtilisateurById(id));
        
        assertTrue(exception.getMessage().contains("999"));
    }

    @Test
    void getChercheurs_ShouldReturnListOfChercheurs() {
        // Arrange
        Utilisateur chercheur1 = createUtilisateur(1L, "Chercheur 1", "chercheur1@example.com");
        Utilisateur chercheur2 = createUtilisateur(2L, "Chercheur 2", "chercheur2@example.com");

        when(utilisateurRepository.findByRoleName("chercheur")).thenReturn(List.of(chercheur1, chercheur2));

        // Act
        List<UtilisateurDto> result = utilisateurService.getChercheurs();

        // Assert
        assertEquals(2, result.size());
        verify(utilisateurRepository).findByRoleName("chercheur");
    }

    @Test
    void getChercheurs_ShouldReturnEmptyList_WhenNoChercheurs() {
        // Arrange
        when(utilisateurRepository.findByRoleName("chercheur")).thenReturn(Collections.emptyList());

        // Act
        List<UtilisateurDto> result = utilisateurService.getChercheurs();

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void getMedecins_ShouldReturnListOfMedecins() {
        // Arrange
        Utilisateur medecin1 = createUtilisateur(1L, "Medecin 1", "medecin1@example.com");
        Utilisateur medecin2 = createUtilisateur(2L, "Medecin 2", "medecin2@example.com");

        when(utilisateurRepository.findByRoleName("medecin")).thenReturn(List.of(medecin1, medecin2));

        // Act
        List<UtilisateurDto> result = utilisateurService.getMedecins();

        // Assert
        assertEquals(2, result.size());
        verify(utilisateurRepository).findByRoleName("medecin");
    }

    @Test
    void getMedecins_ShouldReturnEmptyList_WhenNoMedecins() {
        // Arrange
        when(utilisateurRepository.findByRoleName("medecin")).thenReturn(Collections.emptyList());

        // Act
        List<UtilisateurDto> result = utilisateurService.getMedecins();

        // Assert
        assertTrue(result.isEmpty());
    }

    private Utilisateur createUtilisateur(Long id, String nom, String email) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(id);
        utilisateur.setNom(nom);
        utilisateur.setEmail(email);
        
        // Create and set a role to avoid NullPointerException in UtilisateurDto.from()
        Role role = new Role();
        role.setNom("test_role");
        utilisateur.setRole(role);
        
        return utilisateur;
    }
}
