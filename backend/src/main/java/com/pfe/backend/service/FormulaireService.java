package com.pfe.backend.service;

import com.pfe.backend.dto.ChampRequest;
import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.model.*;
import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.repository.EtudeRepository;
import com.pfe.backend.repository.FormulaireRepository;
import com.pfe.backend.repository.ListeValeurRepository;
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

@Service
@RequiredArgsConstructor
public class FormulaireService {

    private final FormulaireRepository formulaireRepository;
    private final EtudeRepository etudeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteService activiteService;
    private final ListeValeurRepository listeValeurRepository;
    private final com.pfe.backend.repository.FormulaireMedecinRepository formulaireMedecinRepository;
    private final com.pfe.backend.repository.ReponseFormulaireRepository reponseFormulaireRepository;

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
                    // Gérer le cas où l'ID n'est pas trouvé, peut-être lever une exception
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

    @Transactional
    public void deleteFormulaire(Long id, String userEmail) {
        Formulaire formulaire = formulaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé avec l'ID: " + id));
        
        Utilisateur chercheur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + userEmail));
        
        // Vérifier que l'utilisateur est bien le propriétaire du formulaire
        if (!formulaire.getChercheur().getId().equals(chercheur.getId())) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
        }
        
        // Récupérer tous les FormulaireMedecin liés à ce formulaire
        List<FormulaireMedecin> formulairesMedecins = formulaireMedecinRepository
                .findAll()
                .stream()
                .filter(fm -> fm.getFormulaire().getIdFormulaire().equals(id))
                .collect(Collectors.toList());
        
        // Supprimer les réponses pour chaque FormulaireMedecin, puis les FormulaireMedecin eux-mêmes
        for (FormulaireMedecin fm : formulairesMedecins) {
            // Supprimer d'abord les réponses liées à ce FormulaireMedecin
            reponseFormulaireRepository.deleteByFormulaireMedecinId(fm.getId());
            // Puis supprimer le FormulaireMedecin
            formulaireMedecinRepository.delete(fm);
        }
        
        activiteService.enregistrerActivite(userEmail, "Suppression de formulaire",
                "Formulaire", id, "Formulaire '" + formulaire.getTitre() + "' supprimé");
        
        // Enfin, supprimer le formulaire (les champs seront supprimés automatiquement grâce au cascade)
        formulaireRepository.deleteById(id);
    }
}
