package com.pfe.backend.service;

import com.pfe.backend.dto.ChampRequest;
import com.pfe.backend.dto.FormulaireRequest;
import com.pfe.backend.model.*;
import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.repository.EtudeRepository;
import com.pfe.backend.repository.FormulaireRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormulaireService {

    private final FormulaireRepository formulaireRepository;
    private final EtudeRepository etudeRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional
    public Formulaire createFormulaire(FormulaireRequest request, String userEmail) {
        //1. Récupérer l'utilisateur authentifié
        Utilisateur chercheur = utilisateurRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + userEmail));
        
        // 2. Récupérer l'étude associée
        Etude etude = etudeRepository.findById(request.getIdEtude())
                .orElseThrow(() -> new ResourceNotFoundException("Etude non trouvée avec l'ID: " + request.getIdEtude()));
        etude.setUtilisateur(chercheur);

        // 3. Créer l'entité Formulaire principale
        Formulaire formulaire = new Formulaire();
        formulaire.setTitre(request.getTitre());
        formulaire.setDescription(request.getDescription());
        formulaire.setChercheur(chercheur);
        formulaire.setEtude(etude);

        // 4. Convertir le statut de String à Enum
        try {
            StatutFormulaire statut = StatutFormulaire.valueOf(request.getStatut().toUpperCase());
            formulaire.setStatut(statut);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide: " + request.getStatut());
        }



        // 5. Préparer la liste pour les entités Champ
        List<Champ> champs = new ArrayList<>();
        if (request.getChamps() != null) {
            for (ChampRequest champRequest : request.getChamps()) {
                Champ champ = new Champ();
                champ.setLabel(champRequest.getLabel());
                champ.setObligatoire(champRequest.isObligatoire());
                champ.setValeurMin(champRequest.getValeurMin());
                champ.setValeurMax(champRequest.getValeurMax());

                // Lier le champ à son formulaire parent
                champ.setFormulaire(formulaire);

                // Convertir le type de champ de String à Enum
                try {
                    TypeChamp typeChamp = TypeChamp.valueOf(champRequest.getType().toUpperCase());
                    champ.setType(typeChamp);
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Type de champ invalide: " + champRequest.getType());
                }

                // 6. Gérer les listes de valeurs pour les choix multiples
                if (champRequest.getType().equalsIgnoreCase(TypeChamp.CHOIX_MULTIPLE.name()) && champRequest.getOptions() != null && !champRequest.getOptions().isEmpty()) {
                    ListeValeur listeValeur = new ListeValeur();
                    listeValeur.setNom(champRequest.getNomListeValeur());

                    List<OptionValeur> options = champRequest.getOptions().stream().map(optRequest -> {
                        OptionValeur option = new OptionValeur();
                        option.setLibelle(optRequest.getLibelle());
                        option.setValeur(optRequest.getValeur());
                        option.setListeValeur(listeValeur); // Lier l'option à sa liste parente
                        return option;
                    }).collect(Collectors.toList());

                    listeValeur.setOptions(options);
                    champ.setListeValeur(listeValeur);
                }
                champs.add(champ);
            }
        }

        // 7. Lier la liste de champs complète au formulaire
        formulaire.setChamps(champs);

        // 8. Sauvegarder le tout en une seule transaction
        return formulaireRepository.save(formulaire);
    }
}
