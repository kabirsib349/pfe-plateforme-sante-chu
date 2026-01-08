package com.pfe.backend.service;

import com.pfe.backend.dto.ChampRequest;
import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.Champ;
import com.pfe.backend.model.Etude;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.model.ListeValeur;
import com.pfe.backend.model.OptionValeur;
import com.pfe.backend.model.StatutFormulaire;
import com.pfe.backend.model.TypeChamp;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.EtudeRepository;
import com.pfe.backend.repository.FormulaireMedecinRepository;
import com.pfe.backend.repository.FormulaireRepository;
import com.pfe.backend.repository.ListeValeurRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service principal de gestion des formulaires de recherche.
 * Gère la création, modification, suppression et récupération des formulaires complets.
 */
@Service
@RequiredArgsConstructor
public class FormulaireService {

    private final FormulaireRepository formulaireRepository;
    private final EtudeRepository etudeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteService activiteService;
    private final ListeValeurRepository listeValeurRepository;
    private final FormulaireMedecinRepository formulaireMedecinRepository;
    private final ReponseFormulaireRepository reponseFormulaireRepository;

    /**
     * Crée un nouveau formulaire et son étude associée.
     *
     * @param request Données du formulaire et de l'étude
     * @param userEmail Email du chercheur créateur
     * @return Le formulaire créé
     */
    @Transactional
    public Formulaire createFormulaire(FormulaireRequest request, String userEmail) {
        Utilisateur chercheur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + userEmail));

        Etude nouvelleEtude = new Etude();
        nouvelleEtude.setTitre(request.getTitreEtude());
        nouvelleEtude.setDescription(request.getDescriptionEtude());
        nouvelleEtude.setUtilisateur(chercheur);
        Etude etudeEnregistree = etudeRepository.save(nouvelleEtude);

        Formulaire formulaire = new Formulaire();
        formulaire.setTitre(request.getTitre());
        formulaire.setDescription(request.getDescription());
        formulaire.setChercheur(chercheur);
        formulaire.setEtude(etudeEnregistree);

        try {
            formulaire.setStatut(StatutFormulaire.valueOf(request.getStatut().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide: " + request.getStatut());
        }

        if (request.getChamps() != null) {
            formulaire.setChamps(request.getChamps().stream()
                .map(champRequest -> convertChampRequestToChamp(champRequest, formulaire))
                .collect(Collectors.toList()));
        }

        Formulaire savedFormulaire = formulaireRepository.save(formulaire);

        activiteService.enregistrerActivite(userEmail, "Création de formulaire", "Formulaire",
                savedFormulaire.getIdFormulaire(), "Formulaire '" + savedFormulaire.getTitre() + "' créé");

        return savedFormulaire;
    }

    /**
     * Récupère tous les formulaires d'un chercheur.
     *
     * @param email Email du chercheur
     * @return Liste des formulaires avec leurs champs
     */
    @Transactional(readOnly = true)
    public List<Formulaire> getFormulairesByChercheurEmail(String email) {
        List<Formulaire> formulaires = formulaireRepository.findAllWithChampsByChercheurEmail(email);
        if (formulaires.isEmpty()) {
            return formulaires;
        }
        List<ListeValeur> listes = formulaires.stream()
                .flatMap(f -> f.getChamps().stream())
                .map(Champ::getListeValeur)
                .filter(lv -> lv != null)
                .distinct()
                .collect(Collectors.toList());
        if (!listes.isEmpty()) {
            listeValeurRepository.findWithFetchedOptions(listes);
        }
        return formulaires;
    }

    /**
     * Récupère un formulaire par son identifiant.
     *
     * @param id ID du formulaire
     * @return Le formulaire complet
     * @throws ResourceNotFoundException si non trouvé
     */
    @Transactional(readOnly = true)
    public Formulaire getFormulaireById(Long id) {
        Formulaire formulaire = formulaireRepository.findByIdWithChamps(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé avec l'ID: " + id));
        List<ListeValeur> listes = formulaire.getChamps().stream()
                .map(Champ::getListeValeur)
                .filter(lv -> lv != null)
                .distinct()
                .collect(Collectors.toList());
        if (!listes.isEmpty()) {
            listeValeurRepository.findWithFetchedOptions(listes);
        }
        return formulaire;
    }

    /**
     * Met à jour un formulaire existant et ses champs.
     * Gère l'ajout, la modification et la suppression de champs.
     *
     * @param id ID du formulaire
     * @param request Nouvelles données
     * @param userEmail Email de l'utilisateur demandeur (pour vérification)
     * @return Le formulaire mis à jour
     */
    @Transactional
    public Formulaire updateFormulaire(Long id, FormulaireRequest request, String userEmail) {
        Formulaire formulaire = formulaireRepository.findByIdWithChamps(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé avec l'ID: " + id));

        Utilisateur chercheur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + userEmail));

        if (!formulaire.getChercheur().getId().equals(chercheur.getId())) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à modifier ce formulaire");
        }

        formulaire.setTitre(request.getTitre());
        formulaire.setDescription(request.getDescription());
        formulaire.setStatut(StatutFormulaire.valueOf(request.getStatut().toUpperCase()));

        if (formulaire.getEtude() != null) {
            formulaire.getEtude().setTitre(request.getTitreEtude());
            formulaire.getEtude().setDescription(request.getDescriptionEtude());
        }

        updateChamps(formulaire, request.getChamps());

        Formulaire savedFormulaire = formulaireRepository.save(formulaire);

        activiteService.enregistrerActivite(userEmail, "Modification de formulaire", "Formulaire",
                savedFormulaire.getIdFormulaire(), "Formulaire '" + savedFormulaire.getTitre() + "' modifié");

        return savedFormulaire;
    }

    private void updateChamps(Formulaire formulaire, List<ChampRequest> champsRequest) {
        Map<Long, Champ> champsExistantsMap = formulaire.getChamps().stream()
                .collect(Collectors.toMap(Champ::getIdChamp, Function.identity()));

        List<Champ> nouveauxChamps = new ArrayList<>();

        for (ChampRequest req : champsRequest) {
            Champ champ;
            if (req.getId() != null && !req.getId().startsWith("new-")) {
                Long champId = Long.parseLong(req.getId());
                champ = champsExistantsMap.remove(champId);
                if (champ == null) {
                    continue;
                }
            } else {
                champ = new Champ();
                champ.setFormulaire(formulaire);
            }
            updateChampFromRequest(champ, req);
            nouveauxChamps.add(champ);
        }

        formulaire.getChamps().clear();
        formulaire.getChamps().addAll(nouveauxChamps);
    }

    private void updateChampFromRequest(Champ champ, ChampRequest request) {
        champ.setLabel(request.getLabel());
        champ.setUnite(request.getUnite());
        champ.setObligatoire(request.isObligatoire());
        champ.setValeurMin(request.getValeurMin());
        champ.setValeurMax(request.getValeurMax());
        champ.setCategorie(request.getCategorie());
        champ.setType(TypeChamp.valueOf(request.getType().toUpperCase()));

        if (TypeChamp.CHOIX_MULTIPLE.name().equalsIgnoreCase(request.getType())) {
            ListeValeur listeValeur = champ.getListeValeur() != null ? champ.getListeValeur() : new ListeValeur();
            listeValeur.setNom(request.getNomListeValeur());

            if (listeValeur.getOptions() == null) {
                listeValeur.setOptions(new ArrayList<>());
            }
            listeValeur.getOptions().clear();

            if (request.getOptions() != null) {
                request.getOptions().forEach(optRequest -> {
                    OptionValeur option = new OptionValeur();
                    option.setLibelle(optRequest.getLibelle());
                    option.setValeur(optRequest.getValeur());
                    option.setListeValeur(listeValeur);
                    listeValeur.getOptions().add(option);
                });
            }
            champ.setListeValeur(listeValeur);
        } else {
            champ.setListeValeur(null);
        }
    }

    private Champ convertChampRequestToChamp(ChampRequest champRequest, Formulaire formulaire) {
        Champ champ = new Champ();
        champ.setFormulaire(formulaire);
        champ.setCategorie(champRequest.getCategorie());
        updateChampFromRequest(champ, champRequest);
        return champ;
    }

    /**
     * Calcule les statistiques des formulaires pour le tableau de bord.
     *
     * @param userEmail Email du chercheur
     * @return Map contenant les compteurs (total, brouillons, envoyés)
     */
    public Map<String, Object> getStatsByUser(String userEmail) {
        Map<String, Object> stats = new HashMap<>();
        long totalFormulaires = formulaireRepository.countByUserEmail(userEmail);
        long brouillons = formulaireRepository.countByUserEmailAndStatut(userEmail, StatutFormulaire.BROUILLON);
        long envoyes = formulaireRepository.countByUserEmailAndStatut(userEmail, StatutFormulaire.PUBLIE);
        stats.put("totalFormulaires", totalFormulaires);
        stats.put("brouillons", brouillons);
        stats.put("envoyes", envoyes);
        stats.put("activiteRecente", new ArrayList<>());
        return stats;
    }

    /**
     * Supprime un formulaire et toutes ses données associées (réponses, activités).
     *
     * @param id ID du formulaire
     * @param userEmail Email du demandeur pour vérification
     */
    @Transactional
    public void deleteFormulaire(Long id, String userEmail) {
        Formulaire formulaire = formulaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé avec l'ID: " + id));
        
        Utilisateur chercheur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + userEmail));
        
        if (!formulaire.getChercheur().getId().equals(chercheur.getId())) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
        }
        
        List<FormulaireMedecin> formulairesMedecins = formulaireMedecinRepository
                .findAll()
                .stream()
                .filter(fm -> fm.getFormulaire().getIdFormulaire().equals(id))
                .collect(Collectors.toList());
        
        for (FormulaireMedecin fm : formulairesMedecins) {
            reponseFormulaireRepository.deleteByFormulaireMedecinId(fm.getId());
            formulaireMedecinRepository.delete(fm);
        }
        
        activiteService.enregistrerActivite(userEmail, "Suppression de formulaire",
                "Formulaire", id, "Formulaire '" + formulaire.getTitre() + "' supprimé");
        
        formulaireRepository.deleteById(id);
    }
}
