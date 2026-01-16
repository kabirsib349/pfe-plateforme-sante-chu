package com.pfe.backend.service;

import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.*;
import com.pfe.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormulaireMedecinServiceTest {

    @Mock
    private FormulaireMedecinRepository formulaireMedecinRepository;
    @Mock
    private FormulaireRepository formulaireRepository;
    @Mock
    private UtilisateurRepository utilisateurRepository;
    @Mock
    private ActiviteService activiteService;
    @Mock
    private ReponseFormulaireRepository reponseFormulaireRepository;
    @Mock
    private ListeValeurRepository listeValeurRepository;

    @InjectMocks
    private FormulaireMedecinService formulaireMedecinService;

    @Test
    void envoyerFormulaire_ShouldCreateAssignment_WhenValid() {
        // Arrange
        Long formulaireId = 1L;
        String emailMedecin = "medecin@test.com";
        String emailChercheur = "chercheur@test.com";

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setTitre("Test Formulaire");
        formulaire.setStatut(StatutFormulaire.BROUILLON);

        Utilisateur medecin = createUtilisateur(1L, emailMedecin, "Dr. Test");
        Utilisateur chercheur = createUtilisateur(2L, emailChercheur, "Chercheur");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail(emailMedecin)).thenReturn(Optional.of(medecin));
        when(utilisateurRepository.findByEmail(emailChercheur)).thenReturn(Optional.of(chercheur));
        when(formulaireMedecinRepository.findByFormulaireIdFormulaireAndMedecinEmail(formulaireId, emailMedecin))
                .thenReturn(Optional.empty());
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> {
            FormulaireMedecin fm = (FormulaireMedecin) i.getArguments()[0];
            fm.setId(100L);
            return fm;
        });

        // Act
        FormulaireMedecin result = formulaireMedecinService.envoyerFormulaire(formulaireId, emailMedecin, emailChercheur);

        // Assert
        assertNotNull(result);
        assertEquals(formulaire, result.getFormulaire());
        assertEquals(medecin, result.getMedecin());
        assertEquals(chercheur, result.getChercheur());
        assertEquals(StatutFormulaire.PUBLIE, formulaire.getStatut()); // Status should be updated
        verify(activiteService).enregistrerActivite(eq(emailChercheur), eq("Envoi formulaire"), any(), eq(formulaireId), any());
    }

    @Test
    void envoyerFormulaire_ShouldThrowException_WhenFormulaireNotFound() {
        // Arrange
        Long formulaireId = 999L;
        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> formulaireMedecinService.envoyerFormulaire(formulaireId, "medecin@test.com", "chercheur@test.com"));
    }

    @Test
    void envoyerFormulaire_ShouldThrowException_WhenMedecinNotFound() {
        // Arrange
        Long formulaireId = 1L;
        Formulaire formulaire = new Formulaire();
        
        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> formulaireMedecinService.envoyerFormulaire(formulaireId, "unknown@test.com", "chercheur@test.com"));
    }

    @Test
    void envoyerFormulaire_ShouldThrowException_WhenChercheurNotFound() {
        // Arrange
        Long formulaireId = 1L;
        Formulaire formulaire = new Formulaire();
        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com", "Dr. Test");
        
        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail("medecin@test.com")).thenReturn(Optional.of(medecin));
        when(utilisateurRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> formulaireMedecinService.envoyerFormulaire(formulaireId, "medecin@test.com", "unknown@test.com"));
    }

    @Test
    void envoyerFormulaire_ShouldThrowException_WhenAlreadySent() {
        // Arrange
        Long formulaireId = 1L;
        String emailMedecin = "medecin@test.com";
        String emailChercheur = "chercheur@test.com";

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);

        Utilisateur medecin = createUtilisateur(1L, emailMedecin, "Dr. Test");
        Utilisateur chercheur = createUtilisateur(2L, emailChercheur, "Chercheur");

        FormulaireMedecin existingFm = new FormulaireMedecin();
        existingFm.setMasquePourMedecin(false);
        existingFm.setMasquePourChercheur(false);

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail(emailMedecin)).thenReturn(Optional.of(medecin));
        when(utilisateurRepository.findByEmail(emailChercheur)).thenReturn(Optional.of(chercheur));
        when(formulaireMedecinRepository.findByFormulaireIdFormulaireAndMedecinEmail(formulaireId, emailMedecin))
                .thenReturn(Optional.of(existingFm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> formulaireMedecinService.envoyerFormulaire(formulaireId, emailMedecin, emailChercheur));
    }

    @Test
    void envoyerFormulaire_ShouldAllowResend_WhenMasquePourMedecin() {
        // Arrange
        Long formulaireId = 1L;
        String emailMedecin = "medecin@test.com";
        String emailChercheur = "chercheur@test.com";

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setTitre("Test");
        formulaire.setStatut(StatutFormulaire.PUBLIE);

        Utilisateur medecin = createUtilisateur(1L, emailMedecin, "Dr. Test");
        Utilisateur chercheur = createUtilisateur(2L, emailChercheur, "Chercheur");

        FormulaireMedecin existingFm = new FormulaireMedecin();
        existingFm.setMasquePourMedecin(true); // Marked as hidden

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail(emailMedecin)).thenReturn(Optional.of(medecin));
        when(utilisateurRepository.findByEmail(emailChercheur)).thenReturn(Optional.of(chercheur));
        when(formulaireMedecinRepository.findByFormulaireIdFormulaireAndMedecinEmail(formulaireId, emailMedecin))
                .thenReturn(Optional.of(existingFm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        FormulaireMedecin result = formulaireMedecinService.envoyerFormulaire(formulaireId, emailMedecin, emailChercheur);

        // Assert
        assertNotNull(result);
    }

    @Test
    void createEnvoiParChercheur_ShouldCreateAssignment_WithoutMedecin() {
        // Arrange
        Long formulaireId = 1L;
        String emailChercheur = "chercheur@test.com";

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(formulaireId);
        formulaire.setTitre("Test");

        Utilisateur chercheur = createUtilisateur(1L, emailChercheur, "Chercheur");

        when(formulaireRepository.findById(formulaireId)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail(emailChercheur)).thenReturn(Optional.of(chercheur));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        FormulaireMedecin result = formulaireMedecinService.createEnvoiParChercheur(formulaireId, emailChercheur);

        // Assert
        assertNotNull(result);
        assertNull(result.getMedecin());
        assertEquals(chercheur, result.getChercheur());
        verify(activiteService).enregistrerActivite(eq(emailChercheur), eq("Création envoi (chercheur)"), any(), eq(formulaireId), any());
    }

    @Test
    void createEnvoiParChercheur_ShouldThrowException_WhenFormulaireNotFound() {
        // Arrange
        when(formulaireRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> formulaireMedecinService.createEnvoiParChercheur(999L, "chercheur@test.com"));
    }

    @Test
    void createEnvoiParChercheur_ShouldThrowException_WhenChercheurNotFound() {
        // Arrange
        Formulaire formulaire = new Formulaire();
        when(formulaireRepository.findById(1L)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> formulaireMedecinService.createEnvoiParChercheur(1L, "unknown@test.com"));
    }

    @Test
    void getFormulairesRecus_ShouldReturnList() {
        // Arrange
        String emailMedecin = "medecin@test.com";
        FormulaireMedecin fm = new FormulaireMedecin();
        
        when(formulaireMedecinRepository.findByMedecinEmail(emailMedecin)).thenReturn(List.of(fm));

        // Act
        List<FormulaireMedecin> result = formulaireMedecinService.getFormulairesRecus(emailMedecin);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getFormulairePourRemplissage_ShouldReturnFormulaire_WithListeValeurs() {
        // Arrange
        Long fmId = 1L;

        ListeValeur liste = new ListeValeur();
        liste.setNom("TestListe");

        Champ champ = new Champ();
        champ.setIdChamp(100L);
        champ.setListeValeur(liste);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setChamps(List.of(champ));

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act
        Formulaire result = formulaireMedecinService.getFormulairePourRemplissage(fmId);

        // Assert
        assertNotNull(result);
        verify(listeValeurRepository).findWithFetchedOptions(anyList());
    }

    @Test
    void getFormulairePourRemplissage_ShouldNotFetchListes_WhenNone() {
        // Arrange
        Long fmId = 1L;

        Champ champWithoutListe = new Champ();
        champWithoutListe.setIdChamp(100L);
        champWithoutListe.setListeValeur(null);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setChamps(List.of(champWithoutListe));

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act
        Formulaire result = formulaireMedecinService.getFormulairePourRemplissage(fmId);

        // Assert
        assertNotNull(result);
        verify(listeValeurRepository, never()).findWithFetchedOptions(anyList());
    }

    @Test
    void getFormulairePourRemplissage_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(formulaireMedecinRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> formulaireMedecinService.getFormulairePourRemplissage(999L));
    }

    @Test
    void getFormulairesEnvoyes_ShouldReturnList() {
        // Arrange
        String emailChercheur = "chercheur@test.com";
        FormulaireMedecin fm = new FormulaireMedecin();
        
        when(formulaireMedecinRepository.findByChercheurEmail(emailChercheur)).thenReturn(List.of(fm));

        // Act
        List<FormulaireMedecin> result = formulaireMedecinService.getFormulairesEnvoyes(emailChercheur);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getMedecins_ShouldReturnList() {
        // Arrange
        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com", "Dr. Test");
        when(utilisateurRepository.findByRoleName("medecin")).thenReturn(List.of(medecin));

        // Act
        List<Utilisateur> result = formulaireMedecinService.getMedecins();

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void masquerPourMedecin_ShouldMasque_WhenAuthorized() {
        // Arrange
        Long fmId = 1L;
        String emailMedecin = "medecin@test.com";

        Utilisateur medecin = createUtilisateur(1L, emailMedecin, "Dr. Test");

        Formulaire formulaire = new Formulaire();
        formulaire.setTitre("Test");

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);
        fm.setFormulaire(formulaire);
        fm.setMasquePourMedecin(false);
        fm.setMasquePourChercheur(false);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        formulaireMedecinService.masquerPourMedecin(fmId, emailMedecin);

        // Assert
        assertTrue(fm.getMasquePourMedecin());
        verify(formulaireMedecinRepository).save(fm);
    }

    @Test
    void masquerPourMedecin_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        Long fmId = 1L;
        Utilisateur medecin = createUtilisateur(1L, "medecin@test.com", "Dr. Test");

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setMedecin(medecin);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> formulaireMedecinService.masquerPourMedecin(fmId, "other@test.com"));
    }

    @Test
    void masquerPourChercheur_ShouldMasque_WhenAuthorized() {
        // Arrange
        Long fmId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(1L, emailChercheur, "Chercheur");

        Formulaire formulaire = new Formulaire();
        formulaire.setTitre("Test");

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setChercheur(chercheur);
        fm.setFormulaire(formulaire);
        fm.setMasquePourMedecin(false);
        fm.setMasquePourChercheur(false);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        formulaireMedecinService.masquerPourChercheur(fmId, emailChercheur);

        // Assert
        assertTrue(fm.getMasquePourChercheur());
        verify(formulaireMedecinRepository).save(fm);
    }

    @Test
    void masquerPourChercheur_ShouldDeleteDefinitively_WhenBothMasqued() {
        // Arrange
        Long fmId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(1L, emailChercheur, "Chercheur");

        Formulaire formulaire = new Formulaire();
        formulaire.setTitre("Test");

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setChercheur(chercheur);
        fm.setFormulaire(formulaire);
        fm.setMasquePourMedecin(true); // Already masked by medecin
        fm.setMasquePourChercheur(false);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));
        when(formulaireMedecinRepository.save(any(FormulaireMedecin.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        formulaireMedecinService.masquerPourChercheur(fmId, emailChercheur);

        // Assert
        verify(reponseFormulaireRepository).deleteByFormulaireMedecinId(fmId);
        verify(formulaireMedecinRepository).delete(fm);
    }

    @Test
    void supprimerFormulaireMedecin_ShouldDelete_WhenAuthorized() {
        // Arrange
        Long fmId = 1L;
        String emailChercheur = "chercheur@test.com";

        Utilisateur chercheur = createUtilisateur(1L, emailChercheur, "Chercheur");

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act
        formulaireMedecinService.supprimerFormulaireMedecin(fmId, emailChercheur);

        // Assert
        verify(reponseFormulaireRepository).deleteByFormulaireMedecinId(fmId);
        verify(formulaireMedecinRepository).delete(fm);
        verify(activiteService).enregistrerActivite(eq(emailChercheur), eq("Suppression formulaire rempli"), any(), eq(fmId), any());
    }

    @Test
    void supprimerFormulaireMedecin_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        Long fmId = 1L;

        Utilisateur chercheur = createUtilisateur(1L, "chercheur@test.com", "Chercheur");

        Formulaire formulaire = new Formulaire();
        formulaire.setChercheur(chercheur);

        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(fmId);
        fm.setFormulaire(formulaire);

        when(formulaireMedecinRepository.findById(fmId)).thenReturn(Optional.of(fm));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> formulaireMedecinService.supprimerFormulaireMedecin(fmId, "other@test.com"));
    }

    @Test
    void supprimerFormulaireMedecin_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(formulaireMedecinRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> formulaireMedecinService.supprimerFormulaireMedecin(999L, "chercheur@test.com"));
    }

    private Utilisateur createUtilisateur(Long id, String email, String nom) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setId(id);
        utilisateur.setEmail(email);
        utilisateur.setNom(nom);
        return utilisateur;
    }
}
