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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormulaireService {

    private final FormulaireRepository formulaireRepository;
    private final EtudeRepository etudeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteService activiteService;
    private final ListeValeurRepository listeValeurRepository;

    @Transactional
    public Formulaire createFormulaire(FormulaireRequest request, String userEmail) {
        //1. Récupérer l'utilisateur authentifié
        Utilisateur chercheur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + userEmail));
        
        // 2. Créer et sauvegarder la nouvelle étude
       Etude nouvelleEtude = new Etude();
       nouvelleEtude.setTitre(request.getTitreEtude());
       nouvelleEtude.setDescription(request.getDescriptionEtude());
       nouvelleEtude.setUtilisateur(chercheur);
       Etude etudeEnregistree = etudeRepository.save(nouvelleEtude);


        // 3. Créer l'entité Formulaire principale
        Formulaire formulaire = new Formulaire();
        formulaire.setTitre(request.getTitre());
        formulaire.setDescription(request.getDescription());
        formulaire.setChercheur(chercheur);
        formulaire.setEtude(etudeEnregistree);

        // 4. Convertir le statut de String à Enum
        try {
            StatutFormulaire statut = StatutFormulaire.valueOf(request.getStatut().toUpperCase());
            formulaire.setStatut(statut);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide: " + request.getStatut());
        }



        // 5. Créer les champs avec la méthode réutilisable
        List<Champ> champs = creerChamps(request.getChamps(), formulaire);
        formulaire.setChamps(champs);

        // 8. Sauvegarder le tout en une seule transaction
        Formulaire savedFormulaire = formulaireRepository.save(formulaire);
        
        // 9. Enregistrer l'activité
        activiteService.enregistrerActivite(
            userEmail, 
            "Création de formulaire", 
            "Formulaire", 
            savedFormulaire.getIdFormulaire(), 
            "Formulaire '" + savedFormulaire.getTitre() + "' créé"
        );
        
        return savedFormulaire;
    }
    @Transactional(readOnly = true)
    public List<Formulaire> getFormulairesByChercheurEmail(String email) {
        List<Formulaire> formulaires = formulaireRepository.findAllWithChampsByChercheurEmail(email);

        if (formulaires.isEmpty()) {
            return formulaires;
        }

        // Collect all non-null ListeValeur entities
        List<ListeValeur> listes = formulaires.stream()
                .flatMap(f -> f.getChamps().stream())
                .map(Champ::getListeValeur)
                .filter(lv -> lv != null)
                .distinct()
                .collect(Collectors.toList());

        if (!listes.isEmpty()) {
            // This query will fetch the ListeValeur entities again, but this time with their options initialized.
            // The persistence context will merge the results.
            listeValeurRepository.findWithFetchedOptions(listes);
        }

        return formulaires;
    }
    
    @Transactional(readOnly = true)
    public Formulaire getFormulaireById(Long id) {
        // 1. Récupérer le formulaire avec ses champs et listes (mais sans les options)
        Formulaire formulaire = formulaireRepository.findByIdWithChamps(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé avec l'ID: " + id));

        // 2. Récupérer les listes de valeurs qui ne sont pas null
        List<ListeValeur> listes = formulaire.getChamps().stream()
                .map(Champ::getListeValeur)
                .filter(lv -> lv != null)
                .distinct()
                .collect(Collectors.toList());

        // 3. Si des listes existent, charger leurs options dans une seconde requête
        if (!listes.isEmpty()) {
            listeValeurRepository.findWithFetchedOptions(listes);
        }

        return formulaire;
    }


    @Transactional
    public Formulaire updateFormulaire(Long id, FormulaireRequest request, String userEmail) {
        // Réutiliser la méthode existante pour récupérer le formulaire
        Formulaire formulaire = getFormulaireById(id);
        
        // Vérifier que le formulaire appartient au chercheur connecté
        Utilisateur chercheur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + userEmail));
        
        if (!formulaire.getChercheur().getId().equals(chercheur.getId())) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à modifier ce formulaire");
        }

        // Mettre à jour les informations de base
        formulaire.setTitre(request.getTitre());
        formulaire.setDescription(request.getDescription());
        
        // Mettre à jour le statut
        try {
            StatutFormulaire statut = StatutFormulaire.valueOf(request.getStatut().toUpperCase());
            formulaire.setStatut(statut);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide: " + request.getStatut());
        }

        // Mettre à jour l'étude associée
        if (formulaire.getEtude() != null) {
            formulaire.getEtude().setTitre(request.getTitreEtude());
            formulaire.getEtude().setDescription(request.getDescriptionEtude());
        }

        // Supprimer tous les anciens champs et recréer avec la logique existante
        formulaire.getChamps().clear();
        
        // Réutiliser la logique de création des champs de createFormulaire
        List<Champ> nouveauxChamps = creerChamps(request.getChamps(), formulaire);
        formulaire.setChamps(nouveauxChamps);

        Formulaire savedFormulaire = formulaireRepository.save(formulaire);
        
        // Enregistrer l'activité de modification
        activiteService.enregistrerActivite(
            userEmail, 
            "Modification de formulaire", 
            "Formulaire", 
            savedFormulaire.getIdFormulaire(), 
            "Formulaire '" + savedFormulaire.getTitre() + "' modifié"
        );
        
        return savedFormulaire;
    }

    // Méthode privée pour éviter la duplication de code entre create et update
    private List<Champ> creerChamps(List<ChampRequest> champsRequest, Formulaire formulaire) {
        List<Champ> champs = new ArrayList<>();
        if (champsRequest != null) {
            for (ChampRequest champRequest : champsRequest) {
                Champ champ = new Champ();
                champ.setLabel(champRequest.getLabel());
                champ.setUnite(champRequest.getUnite());
                champ.setObligatoire(champRequest.isObligatoire());
                champ.setValeurMin(champRequest.getValeurMin());
                champ.setValeurMax(champRequest.getValeurMax());
                champ.setFormulaire(formulaire);

                try {
                    TypeChamp typeChamp = TypeChamp.valueOf(champRequest.getType().toUpperCase());
                    champ.setType(typeChamp);
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Type de champ invalide: " + champRequest.getType());
                }

                if (champRequest.getType().equalsIgnoreCase(TypeChamp.CHOIX_MULTIPLE.name()) && champRequest.getOptions() != null && !champRequest.getOptions().isEmpty()) {
                    ListeValeur listeValeur = new ListeValeur();
                    listeValeur.setNom(champRequest.getNomListeValeur());

                    List<OptionValeur> options = champRequest.getOptions().stream().map(optRequest -> {
                        OptionValeur option = new OptionValeur();
                        option.setLibelle(optRequest.getLibelle());
                        option.setValeur(optRequest.getValeur());
                        option.setListeValeur(listeValeur);
                        return option;
                    }).collect(Collectors.toList());

                    listeValeur.setOptions(options);
                    champ.setListeValeur(listeValeur);
                }
                champs.add(champ);
            }
        }
        return champs;
    }

    public Map<String, Object> getStatsByUser(String userEmail) {
        Map<String, Object> stats = new HashMap<>();
        
        // Statistiques générales
        long totalFormulaires = formulaireRepository.countByUserEmail(userEmail);
        long brouillons = formulaireRepository.countByUserEmailAndStatut(userEmail, StatutFormulaire.BROUILLON);
        long envoyes = formulaireRepository.countByUserEmailAndStatut(userEmail, StatutFormulaire.PUBLIE);

        
        stats.put("totalFormulaires", totalFormulaires);
        stats.put("brouillons", brouillons);
        stats.put("envoyes", envoyes);

        
        // Données pour les graphiques (à implémenter plus tard si nécessaire)
        stats.put("activiteRecente", new ArrayList<>());
        
        return stats;
    }

    public void deleteFormulaire(Long id) {
        Formulaire formulaire = formulaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé avec l'ID: " + id));
        
        // Enregistrer l'activité avant suppression
        if (formulaire.getChercheur() != null) {
            activiteService.enregistrerActivite(
                formulaire.getChercheur().getEmail(), 
                "Suppression de formulaire", 
                "Formulaire", 
                id, 
                "Formulaire '" + formulaire.getTitre() + "' supprimé"
            );
        }
        
        formulaireRepository.deleteById(id);
    }
}
