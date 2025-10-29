
package com.pfe.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.dto.ChampRequest;
import com.pfe.backend.dto.OptionValeurRequest;
import com.pfe.backend.model.Role;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.model.Etude;
import com.pfe.backend.repository.RoleRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import com.pfe.backend.repository.EtudeRepository;
import com.pfe.backend.repository.FormulaireRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;


@SpringBootTest
@AutoConfigureMockMvc
@Transactional
// @ActiveProfiles("test") // 🎯 Commenté pour utiliser PostgreSQL au lieu de H2
public class FormulaireControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EtudeRepository etudeRepository;

    @Autowired
    private FormulaireRepository formulaireRepository;

    private Utilisateur testChercheur;
    private Etude testEtude;

    @BeforeEach
    void setUp() {
        formulaireRepository.deleteAll();
        etudeRepository.deleteAll();
        utilisateurRepository.deleteAll();

        // Chercher ou créer le rôle chercheur
        Role chercheurRole = roleRepository.findByNom("chercheur")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setNom("chercheur");
                    return roleRepository.save(newRole);
                });

        testChercheur = new Utilisateur();
        testChercheur.setEmail("chercheur@test.com");
        testChercheur.setNom("Test Chercheur");
        testChercheur.setMotDePasse("password");
        testChercheur.setRole(chercheurRole);
        utilisateurRepository.save(testChercheur);

        testEtude = new Etude();
        testEtude.setTitre("Etude de test");
        testEtude.setUtilisateur(testChercheur);
        etudeRepository.save(testEtude);
    }

    @Test
    @WithMockUser(username = "chercheur@test.com", authorities = { "chercheur" })
    void testCreateFormulaire_Success() throws Exception {
        // Arrange
        OptionValeurRequest option1 = new OptionValeurRequest();
        option1.setLibelle("Homme");
        option1.setValeur("H");

        OptionValeurRequest option2 = new OptionValeurRequest();
        option2.setLibelle("Femme");
        option2.setValeur("F");

        ChampRequest champTexte = new ChampRequest();
        champTexte.setLabel("Nom du patient");
        champTexte.setType("TEXTE");
        champTexte.setObligatoire(true);

        ChampRequest champChoixMultiple = new ChampRequest();
        champChoixMultiple.setLabel("Sexe");
        champChoixMultiple.setType("CHOIX_MULTIPLE");
        champChoixMultiple.setNomListeValeur("Liste Sexe");
        champChoixMultiple.setOptions(List.of(option1, option2));

        FormulaireRequest request = new FormulaireRequest();
        request.setTitre("Formulaire de test");
        request.setDescription("Description du formulaire de test");
        request.setStatut("BROUILLON");
        request.setIdEtude(testEtude.getIdEtude());
        request.setChamps(List.of(champTexte, champChoixMultiple));

        // Act & Assert
        mockMvc.perform(post("/api/formulaires")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idFormulaire", notNullValue()))
                .andExpect(jsonPath("$.titre", is("Formulaire de test")))
                .andExpect(jsonPath("$.champs", hasSize(2)))
                .andExpect(jsonPath("$.champs[0].label", is("Nom du patient")))
                .andExpect(jsonPath("$.champs[0].type", is("texte")))
                .andExpect(jsonPath("$.champs[1].label", is("Sexe")))
                .andExpect(jsonPath("$.champs[1].type", is("choix_multiple")))
                .andExpect(jsonPath("$.champs[1].listeValeur.nom", is("Liste Sexe")))
                .andExpect(jsonPath("$.champs[1].listeValeur.options", hasSize(2)))
                .andExpect(jsonPath("$.champs[1].listeValeur.options[0].libelle", is("Homme")))
                .andExpect(jsonPath("$.champs[1].listeValeur.options[1].libelle", is("Femme")));
    }
}
