package com.pfe.backend.service;

import com.pfe.backend.dto.ChampRequest;
import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.dto.OptionValeurRequest;
import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.*;
import com.pfe.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormulaireServiceTest {

    @Mock
    private FormulaireRepository formulaireRepository;
    @Mock
    private UtilisateurRepository utilisateurRepository;
    @Mock
    private ActiviteService activiteService;
    @Mock
    private ListeValeurRepository listeValeurRepository;
    @Mock
    private FormulaireMedecinRepository formulaireMedecinRepository;
    @Mock
    private ReponseFormulaireRepository reponseFormulaireRepository;

    @InjectMocks
    private FormulaireService formulaireService;

    @Test
    void createFormulaire_ShouldSaveForm_WhenValidRequest() {
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Etude COVID");
        request.setDescriptionEtude("Description");
        request.setStatut("BROUILLON");
        request.setChamps(new ArrayList<>());

        Utilisateur chercheur = new Utilisateur();
        chercheur.setEmail(email);

        Formulaire savedFormulaire = new Formulaire();
        savedFormulaire.setIdFormulaire(1L);
        savedFormulaire.setTitre(request.getTitre());
        savedFormulaire.setStatut(StatutFormulaire.BROUILLON);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenReturn(savedFormulaire);

        Formulaire result = formulaireService.createFormulaire(request, email);

        assertNotNull(result);
        assertEquals(1L, result.getIdFormulaire());
        verify(activiteService).enregistrerActivite(eq(email), eq("Création de formulaire"), anyString(), eq(1L), anyString());
    }

    @Test
    void createFormulaire_ShouldThrowException_WhenUserNotFound() {
        FormulaireRequest request = new FormulaireRequest();
        when(utilisateurRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> formulaireService.createFormulaire(request, "unknown@test.com"));
    }

    @Test
    void createFormulaire_ShouldThrowException_WhenStatusInvalid() {
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setStatut("INVALID_STATUS");
        
        Utilisateur chercheur = new Utilisateur();
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));

        assertThrows(IllegalArgumentException.class, () -> formulaireService.createFormulaire(request, email));
    }

    @Test
    void getFormulaireById_ShouldReturnForm_WhenFound() {
        Long id = 1L;
        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(id);
        formulaire.setChamps(new ArrayList<>());

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(formulaire));

        Formulaire result = formulaireService.getFormulaireById(id);

        assertNotNull(result);
        assertEquals(id, result.getIdFormulaire());
    }

    @Test
    void getFormulaireById_ShouldThrowException_WhenNotFound() {
        when(formulaireRepository.findByIdWithChamps(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> formulaireService.getFormulaireById(1L));
    }

    @Test
    void updateFormulaire_ShouldUpdateFields_WhenAuthorized() {
        Long id = 1L;
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("New Title");
        request.setDescriptionEtude("New Desc");
        request.setStatut("PUBLIE");
        request.setChamps(new ArrayList<>());

        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L);
        chercheur.setEmail(email);

        Formulaire existingForm = new Formulaire();
        existingForm.setIdFormulaire(id);
        existingForm.setChercheur(chercheur);
        existingForm.setChamps(new ArrayList<>());

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenReturn(existingForm);

        Formulaire result = formulaireService.updateFormulaire(id, request, email);

        assertEquals("New Title", result.getTitre());
        assertEquals(StatutFormulaire.PUBLIE, result.getStatut());
        verify(activiteService).enregistrerActivite(eq(email), eq("Modification de formulaire"), anyString(), eq(id), anyString());
    }

    @Test
    void updateFormulaire_ShouldThrowException_WhenUnauthorized() {
        Long id = 1L;
        String email = "other@test.com";
        FormulaireRequest request = new FormulaireRequest();

        Utilisateur owner = new Utilisateur();
        owner.setId(10L);
        
        Utilisateur otherUser = new Utilisateur();
        otherUser.setId(20L); // Different ID

        Formulaire existingForm = new Formulaire();
        existingForm.setChercheur(owner);

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(otherUser));

        assertThrows(IllegalArgumentException.class, () -> formulaireService.updateFormulaire(id, request, email));
    }

    @Test
    void deleteFormulaire_ShouldDeleteDependencies_WhenAuthorized() {
        Long id = 1L;
        String email = "chercheur@test.com";

        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(id);
        formulaire.setTitre("Test");
        formulaire.setChercheur(chercheur);

        when(formulaireRepository.findById(id)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireMedecinRepository.findAll()).thenReturn(Collections.emptyList());

        formulaireService.deleteFormulaire(id, email);

        verify(reponseFormulaireRepository, never()).deleteByFormulaireMedecinId(anyLong()); // No assigned forms mocked
        verify(formulaireRepository).deleteById(id);
        verify(activiteService).enregistrerActivite(anyString(), eq("Suppression de formulaire"), anyString(), eq(id), anyString());
    }

    @Test
    void getStatsByUser_ShouldReturnCounts() {
        String email = "test@test.com";
        when(formulaireRepository.countByUserEmail(email)).thenReturn(10L);
        when(formulaireRepository.countByUserEmailAndStatut(email, StatutFormulaire.BROUILLON)).thenReturn(3L);
        when(formulaireRepository.countByUserEmailAndStatut(email, StatutFormulaire.PUBLIE)).thenReturn(7L);

        Map<String, Object> stats = formulaireService.getStatsByUser(email);

        assertEquals(10L, stats.get("totalFormulaires"));
        assertEquals(3L, stats.get("brouillons"));
        assertEquals(7L, stats.get("envoyes"));
    }

    @Test
    void createFormulaire_ShouldSaveWithChampsAndOptions() {
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Complex Form");
        request.setStatut("BROUILLON");
        
        ChampRequest champ = new ChampRequest();
        champ.setLabel("Q1");
        champ.setType("CHOIX_UNIQUE");
        champ.setObligatoire(true);
        
        com.pfe.backend.dto.OptionValeurRequest opt1 = new com.pfe.backend.dto.OptionValeurRequest();
        opt1.setLibelle("Yes");
        opt1.setValeur("YES");
        champ.setOptions(List.of(opt1));
        
        request.setChamps(List.of(champ));

        Utilisateur chercheur = new Utilisateur();
        chercheur.setEmail(email);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.createFormulaire(request, email);

        assertNotNull(result.getChamps());
        assertEquals(1, result.getChamps().size());
        Champ savedChamp = result.getChamps().get(0);
        assertEquals("Q1", savedChamp.getLabel());
        assertEquals(TypeChamp.CHOIX_UNIQUE, savedChamp.getType());
        assertNotNull(savedChamp.getListeValeur());
        assertEquals(1, savedChamp.getListeValeur().getOptions().size());
        assertEquals("List_Q1", savedChamp.getListeValeur().getNom().replace("LISTE_", "List_")); // Checking partial match or logic if needed, actually code says LISTE_Q1
    }

    @Test
    void getFormulairesByChercheurEmail_ShouldReturnList() {
        String email = "chercheur@test.com";
        Formulaire f1 = new Formulaire();
        f1.setChamps(new ArrayList<>());
        
        when(formulaireRepository.findAllWithChampsByChercheurEmail(email)).thenReturn(List.of(f1));

        List<Formulaire> result = formulaireService.getFormulairesByChercheurEmail(email);

        assertEquals(1, result.size());
        verify(listeValeurRepository, never()).findWithFetchedOptions(anyList()); // No lists in this case
    }
    
    @Test
    void updateFormulaire_ShouldHandleChampUpdates() {
        Long id = 1L;
        String email = "chercheur@test.com";
        
        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L);
        chercheur.setEmail(email);
        
        Formulaire existingForm = new Formulaire();
        existingForm.setIdFormulaire(id);
        existingForm.setChercheur(chercheur);
        
        Champ existingChamp = new Champ();
        existingChamp.setIdChamp(100L);
        existingChamp.setLabel("Old Label");
        existingChamp.setFormulaire(existingForm);
        
        existingForm.setChamps(new ArrayList<>(List.of(existingChamp))); // Mutable list

        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Updated");
        request.setStatut("BROUILLON");
        
        ChampRequest updateExisting = new ChampRequest();
        updateExisting.setId("100");
        updateExisting.setLabel("New Label");
        updateExisting.setType("TEXTE");
        
        ChampRequest addNew = new ChampRequest();
        addNew.setId("new-1");
        addNew.setLabel("New Field");
        addNew.setType("NOMBRE");
        
        request.setChamps(List.of(updateExisting, addNew));

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.updateFormulaire(id, request, email);

        assertEquals(2, result.getChamps().size());
        assertTrue(result.getChamps().stream().anyMatch(c -> c.getLabel().equals("New Label")));
        assertTrue(result.getChamps().stream().anyMatch(c -> c.getLabel().equals("New Field")));
    }
    
    @Test
    void deleteFormulaire_ShouldDeleteResponsiveData() {
        Long id = 1L;
        String email = "chercheur@test.com";

        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(id);
        formulaire.setChercheur(chercheur);
        
        FormulaireMedecin fm = new FormulaireMedecin();
        fm.setId(500L);
        fm.setFormulaire(formulaire);

        when(formulaireRepository.findById(id)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireMedecinRepository.findAll()).thenReturn(List.of(fm)); // Return list to trigger loop

        formulaireService.deleteFormulaire(id, email);

        verify(reponseFormulaireRepository).deleteByFormulaireMedecinId(500L);
        verify(formulaireMedecinRepository).delete(fm);
        verify(formulaireRepository).deleteById(id);
    }

    @Test
    void getFormulairesByChercheurEmail_ShouldReturnEmpty_WhenNoneFound() {
        String email = "chercheur@test.com";
        when(formulaireRepository.findAllWithChampsByChercheurEmail(email)).thenReturn(Collections.emptyList());

        List<Formulaire> result = formulaireService.getFormulairesByChercheurEmail(email);

        assertTrue(result.isEmpty());
        verify(listeValeurRepository, never()).findWithFetchedOptions(anyList());
    }

    @Test
    void updateFormulaire_ShouldIgnoreUnknownChampId_AndClearList_WhenTypeChanges() {
        Long id = 1L;
        String email = "chercheur@test.com";
        
        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L); 
        chercheur.setEmail(email);

        Formulaire existingForm = new Formulaire();
        existingForm.setIdFormulaire(id);
        existingForm.setChercheur(chercheur);
        
        Champ existingChamp = new Champ();
        existingChamp.setIdChamp(100L);
        existingChamp.setLabel("Old Label");
        existingChamp.setType(TypeChamp.CHOIX_UNIQUE);
        existingChamp.setListeValeur(new ListeValeur());
        existingChamp.setFormulaire(existingForm);
        
        existingForm.setChamps(new ArrayList<>(List.of(existingChamp)));

        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Updated");
        request.setStatut("BROUILLON");
        
        ChampRequest updateType = new ChampRequest();
        updateType.setId("100");
        updateType.setLabel("Now Text");
        updateType.setType("TEXTE");

        ChampRequest unknownId = new ChampRequest();
        unknownId.setId("9999"); // Does not exist
        unknownId.setLabel("Unknown");
        unknownId.setType("TEXTE");

        request.setChamps(List.of(updateType, unknownId));

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.updateFormulaire(id, request, email);

        assertEquals(1, result.getChamps().size());
        
        Champ updatedChamp = result.getChamps().get(0);
        assertEquals("Now Text", updatedChamp.getLabel());
        assertEquals(TypeChamp.TEXTE, updatedChamp.getType());
        assertNull(updatedChamp.getListeValeur()); // Should be cleared
    }

    @Test
    void createFormulaire_ShouldHandleCustomListName_AndNullOptions() {
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Form");
        request.setStatut("BROUILLON");
        
        ChampRequest champ = new ChampRequest();
        champ.setLabel("Q1");
        champ.setType("CHOIX_UNIQUE");
        champ.setNomListeValeur("MyCustomList"); 
        champ.setOptions(null); 
        
        request.setChamps(List.of(champ));

        Utilisateur chercheur = new Utilisateur();
        chercheur.setEmail(email);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.createFormulaire(request, email);

        Champ savedChamp = result.getChamps().get(0);
        assertEquals("MyCustomList", savedChamp.getListeValeur().getNom());
        assertNotNull(savedChamp.getListeValeur().getOptions()); // Should be initialized to empty list
        assertTrue(savedChamp.getListeValeur().getOptions().isEmpty());
    }
    
    @Test
    void updateFormulaire_ShouldReuseExistingList_WhenUpdatingChoiceField() {
        Long id = 1L;
        String email = "chercheur@test.com";
        
        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L); 
        chercheur.setEmail(email);

        Formulaire existingForm = new Formulaire();
        existingForm.setIdFormulaire(id);
        existingForm.setChercheur(chercheur);
        
        ListeValeur existingList = new ListeValeur();
        existingList.setNom("OldName");
        existingList.setOptions(new ArrayList<>());
        
        Champ existingChamp = new Champ();
        existingChamp.setIdChamp(100L);
        existingChamp.setType(TypeChamp.CHOIX_UNIQUE);
        existingChamp.setListeValeur(existingList);
        existingChamp.setFormulaire(existingForm);
        
        existingForm.setChamps(new ArrayList<>(List.of(existingChamp)));

        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Updated");
        request.setStatut("BROUILLON");
        
        ChampRequest updateObj = new ChampRequest();
        updateObj.setId("100");
        updateObj.setLabel("Label");
        updateObj.setType("CHOIX_MULTIPLE"); 
        
        request.setChamps(List.of(updateObj));

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.updateFormulaire(id, request, email);
        
        Champ resChamp = result.getChamps().get(0);
        assertEquals(existingList, resChamp.getListeValeur()); 
    }

    @Test
    void deleteFormulaire_ShouldThrowException_WhenFormulaireNotFound() {
        Long id = 999L;
        String email = "chercheur@test.com";

        when(formulaireRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> formulaireService.deleteFormulaire(id, email));
        verify(formulaireRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteFormulaire_ShouldThrowException_WhenUnauthorized() {
        Long id = 1L;
        String email = "other@test.com";

        Utilisateur owner = new Utilisateur();
        owner.setId(10L);

        Utilisateur otherUser = new Utilisateur();
        otherUser.setId(20L); // Different ID

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(id);
        formulaire.setChercheur(owner);

        when(formulaireRepository.findById(id)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(otherUser));

        assertThrows(IllegalArgumentException.class, () -> formulaireService.deleteFormulaire(id, email));
        verify(formulaireRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteFormulaire_ShouldThrowException_WhenUserNotFound() {
        Long id = 1L;
        String email = "unknown@test.com";

        Utilisateur owner = new Utilisateur();
        owner.setId(10L);

        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(id);
        formulaire.setChercheur(owner);

        when(formulaireRepository.findById(id)).thenReturn(Optional.of(formulaire));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> formulaireService.deleteFormulaire(id, email));
        verify(formulaireRepository, never()).deleteById(anyLong());
    }

    @Test
    void updateFormulaire_ShouldThrowException_WhenFormulaireNotFound() {
        Long id = 999L;
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> formulaireService.updateFormulaire(id, request, email));
        verify(formulaireRepository, never()).save(any(Formulaire.class));
    }

    @Test
    void updateFormulaire_ShouldThrowException_WhenUserNotFound() {
        Long id = 1L;
        String email = "unknown@test.com";
        FormulaireRequest request = new FormulaireRequest();

        Utilisateur owner = new Utilisateur();
        owner.setId(10L);

        Formulaire existingForm = new Formulaire();
        existingForm.setIdFormulaire(id);
        existingForm.setChercheur(owner);

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> formulaireService.updateFormulaire(id, request, email));
        verify(formulaireRepository, never()).save(any(Formulaire.class));
    }

    @Test
    void getFormulaireById_ShouldFetchListeValeurOptions_WhenChampsHaveListeValeur() {
        Long id = 1L;
        
        ListeValeur liste = new ListeValeur();
        liste.setNom("TestList");
        
        Champ champWithListe = new Champ();
        champWithListe.setIdChamp(100L);
        champWithListe.setListeValeur(liste);
        
        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(id);
        formulaire.setChamps(List.of(champWithListe));

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(formulaire));

        Formulaire result = formulaireService.getFormulaireById(id);

        assertNotNull(result);
        verify(listeValeurRepository).findWithFetchedOptions(anyList());
    }

    @Test
    void getFormulairesByChercheurEmail_ShouldFetchListeValeurOptions_WhenChampsHaveListeValeur() {
        String email = "chercheur@test.com";
        
        ListeValeur liste = new ListeValeur();
        liste.setNom("TestList");
        
        Champ champWithListe = new Champ();
        champWithListe.setIdChamp(100L);
        champWithListe.setListeValeur(liste);
        
        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setChamps(List.of(champWithListe));

        when(formulaireRepository.findAllWithChampsByChercheurEmail(email)).thenReturn(List.of(formulaire));

        List<Formulaire> result = formulaireService.getFormulairesByChercheurEmail(email);

        assertEquals(1, result.size());
        verify(listeValeurRepository).findWithFetchedOptions(anyList());
    }

    @Test
    void createFormulaire_ShouldHandleChoixMultiple_WithOptions() {
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Multi Choice Form");
        request.setStatut("BROUILLON");
        
        ChampRequest champ = new ChampRequest();
        champ.setLabel("Question Multi");
        champ.setType("CHOIX_MULTIPLE");
        champ.setObligatoire(false);
        
        com.pfe.backend.dto.OptionValeurRequest opt1 = new com.pfe.backend.dto.OptionValeurRequest();
        opt1.setLibelle("Option A");
        opt1.setValeur("A");
        com.pfe.backend.dto.OptionValeurRequest opt2 = new com.pfe.backend.dto.OptionValeurRequest();
        opt2.setLibelle("Option B");
        opt2.setValeur("B");
        champ.setOptions(List.of(opt1, opt2));
        
        request.setChamps(List.of(champ));

        Utilisateur chercheur = new Utilisateur();
        chercheur.setEmail(email);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.createFormulaire(request, email);

        assertNotNull(result.getChamps());
        assertEquals(1, result.getChamps().size());
        Champ savedChamp = result.getChamps().get(0);
        assertEquals(TypeChamp.CHOIX_MULTIPLE, savedChamp.getType());
        assertEquals(2, savedChamp.getListeValeur().getOptions().size());
    }

    @Test
    void createFormulaire_ShouldHandleNullChamps() {
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Form Without Champs");
        request.setStatut("BROUILLON");
        request.setChamps(null);

        Utilisateur chercheur = new Utilisateur();
        chercheur.setEmail(email);

        Formulaire savedFormulaire = new Formulaire();
        savedFormulaire.setIdFormulaire(1L);
        savedFormulaire.setTitre(request.getTitre());

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenReturn(savedFormulaire);

        Formulaire result = formulaireService.createFormulaire(request, email);

        assertNotNull(result);
        assertEquals(1L, result.getIdFormulaire());
    }

    @Test
    void updateFormulaire_ShouldHandleNullChampId() {
        Long id = 1L;
        String email = "chercheur@test.com";
        
        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L);
        chercheur.setEmail(email);
        
        Formulaire existingForm = new Formulaire();
        existingForm.setIdFormulaire(id);
        existingForm.setChercheur(chercheur);
        existingForm.setChamps(new ArrayList<>());

        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Updated");
        request.setStatut("BROUILLON");
        
        ChampRequest newChamp = new ChampRequest();
        newChamp.setId(null); // null ID should create new champ
        newChamp.setLabel("New Field");
        newChamp.setType("TEXTE");
        
        request.setChamps(List.of(newChamp));

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.updateFormulaire(id, request, email);

        assertEquals(1, result.getChamps().size());
        assertEquals("New Field", result.getChamps().get(0).getLabel());
    }

    @Test
    void updateFormulaire_ShouldUpdateExistingOptionsInListeValeur() {
        Long id = 1L;
        String email = "chercheur@test.com";
        
        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L);
        chercheur.setEmail(email);

        ListeValeur existingListe = new ListeValeur();
        existingListe.setNom("OldName");
        existingListe.setOptions(new ArrayList<>());
        
        OptionValeur oldOption = new OptionValeur();
        oldOption.setLibelle("Old Option");
        oldOption.setValeur("OLD");
        oldOption.setListeValeur(existingListe);
        existingListe.getOptions().add(oldOption);

        Champ existingChamp = new Champ();
        existingChamp.setIdChamp(100L);
        existingChamp.setType(TypeChamp.CHOIX_UNIQUE);
        existingChamp.setListeValeur(existingListe);
        
        Formulaire existingForm = new Formulaire();
        existingForm.setIdFormulaire(id);
        existingForm.setChercheur(chercheur);
        existingChamp.setFormulaire(existingForm);
        existingForm.setChamps(new ArrayList<>(List.of(existingChamp)));

        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Updated");
        request.setStatut("BROUILLON");
        
        ChampRequest updateChamp = new ChampRequest();
        updateChamp.setId("100");
        updateChamp.setLabel("Updated Label");
        updateChamp.setType("CHOIX_UNIQUE");
        
        com.pfe.backend.dto.OptionValeurRequest newOpt = new com.pfe.backend.dto.OptionValeurRequest();
        newOpt.setLibelle("New Option");
        newOpt.setValeur("NEW");
        updateChamp.setOptions(List.of(newOpt));
        updateChamp.setNomListeValeur("NewListName");
        
        request.setChamps(List.of(updateChamp));

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.updateFormulaire(id, request, email);

        Champ resChamp = result.getChamps().get(0);
        assertEquals("NewListName", resChamp.getListeValeur().getNom());
        assertEquals(1, resChamp.getListeValeur().getOptions().size());
        assertEquals("New Option", resChamp.getListeValeur().getOptions().get(0).getLibelle());
    }

    @Test
    void createFormulaire_ShouldSetAllChampFields() {
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Complete Form");
        request.setStatut("PUBLIE");
        
        ChampRequest champ = new ChampRequest();
        champ.setLabel("Age");
        champ.setType("NOMBRE");
        champ.setObligatoire(true);
        champ.setUnite("années");
        champ.setValeurMin(0.0f);
        champ.setValeurMax(150.0f);
        champ.setCategorie("Démographie");
        
        request.setChamps(List.of(champ));

        Utilisateur chercheur = new Utilisateur();
        chercheur.setEmail(email);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.createFormulaire(request, email);

        Champ savedChamp = result.getChamps().get(0);
        assertEquals("Age", savedChamp.getLabel());
        assertEquals("années", savedChamp.getUnite());
        assertTrue(savedChamp.isObligatoire());
        assertEquals(0.0f, savedChamp.getValeurMin());
        assertEquals(150.0f, savedChamp.getValeurMax());
        assertEquals("Démographie", savedChamp.getCategorie());
        assertEquals(TypeChamp.NOMBRE, savedChamp.getType());
        assertEquals(StatutFormulaire.PUBLIE, result.getStatut());
    }

    @Test
    void createFormulaire_ShouldSetDateFields() {
        String email = "chercheur@test.com";
        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Date Form");
        request.setStatut("BROUILLON");
        
        ChampRequest champ = new ChampRequest();
        champ.setLabel("Date de naissance");
        champ.setType("DATE");
        champ.setDateMin(LocalDate.of(1900, 1, 1));
        champ.setDateMax(LocalDate.of(2024, 12, 31));
        
        request.setChamps(List.of(champ));

        Utilisateur chercheur = new Utilisateur();
        chercheur.setEmail(email);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.createFormulaire(request, email);

        Champ savedChamp = result.getChamps().get(0);
        assertEquals("Date de naissance", savedChamp.getLabel());
        assertEquals(LocalDate.of(1900, 1, 1), savedChamp.getDateMin());
        assertEquals(LocalDate.of(2024, 12, 31), savedChamp.getDateMax());
        assertEquals(TypeChamp.DATE, savedChamp.getType());
    }

    @Test
    void updateFormulaire_ShouldGenerateDefaultListeName_WhenNomListeValeurEmpty() {
        Long id = 1L;
        String email = "chercheur@test.com";
        
        Utilisateur chercheur = new Utilisateur();
        chercheur.setId(10L);
        chercheur.setEmail(email);

        Formulaire existingForm = new Formulaire();
        existingForm.setIdFormulaire(id);
        existingForm.setChercheur(chercheur);
        existingForm.setChamps(new ArrayList<>());

        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Updated");
        request.setStatut("BROUILLON");
        
        ChampRequest newChamp = new ChampRequest();
        newChamp.setId("new-1");
        newChamp.setLabel("My Choice");
        newChamp.setType("CHOIX_UNIQUE");
        newChamp.setNomListeValeur(""); // Empty string should trigger default name generation
        
        request.setChamps(List.of(newChamp));

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(existingForm));
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(chercheur));
        when(formulaireRepository.save(any(Formulaire.class))).thenAnswer(i -> i.getArguments()[0]);

        Formulaire result = formulaireService.updateFormulaire(id, request, email);

        Champ resChamp = result.getChamps().get(0);
        assertEquals("LISTE_MY_CHOICE", resChamp.getListeValeur().getNom());
    }

    @Test
    void getFormulaireById_ShouldHandleChampsWithNullListeValeur() {
        Long id = 1L;
        
        Champ champWithoutListe = new Champ();
        champWithoutListe.setIdChamp(100L);
        champWithoutListe.setListeValeur(null);
        
        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(id);
        formulaire.setChamps(List.of(champWithoutListe));

        when(formulaireRepository.findByIdWithChamps(id)).thenReturn(Optional.of(formulaire));

        Formulaire result = formulaireService.getFormulaireById(id);

        assertNotNull(result);
        verify(listeValeurRepository, never()).findWithFetchedOptions(anyList());
    }

    @Test
    void getFormulairesByChercheurEmail_ShouldFilterDistinctListeValeurs() {
        String email = "chercheur@test.com";
        
        ListeValeur sharedListe = new ListeValeur();
        sharedListe.setNom("SharedList");
        
        Champ champ1 = new Champ();
        champ1.setIdChamp(100L);
        champ1.setListeValeur(sharedListe);
        
        Champ champ2 = new Champ();
        champ2.setIdChamp(101L);
        champ2.setListeValeur(sharedListe); // Same liste
        
        Formulaire formulaire = new Formulaire();
        formulaire.setIdFormulaire(1L);
        formulaire.setChamps(List.of(champ1, champ2));

        when(formulaireRepository.findAllWithChampsByChercheurEmail(email)).thenReturn(List.of(formulaire));

        List<Formulaire> result = formulaireService.getFormulairesByChercheurEmail(email);

        assertEquals(1, result.size());
        verify(listeValeurRepository).findWithFetchedOptions(anyList());
    }
}
