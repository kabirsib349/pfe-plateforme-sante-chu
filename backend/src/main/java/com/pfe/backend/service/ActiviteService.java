package com.pfe.backend.service;

import com.pfe.backend.model.Activite;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.ActiviteRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service de gestion de l'historique des activités.
 * Enregistre les actions des utilisateurs (création de formulaire, suppression, etc.) pour l'audit.
 */
@Service
@RequiredArgsConstructor
public class ActiviteService {

    private final ActiviteRepository activiteRepository;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * Enregistre une nouvelle activité dans l'historique.
     *
     * @param userEmail email de l'utilisateur ayant effectué l'action
     * @param action type d'action (ex: CREATION, SUPPRESSION)
     * @param ressourceType type de ressource concernée (ex: FORMULAIRE, UTILISATEUR)
     * @param ressourceId identifiant de la ressource
     * @param details détails supplémentaires optionnels
     */
    public void enregistrerActivite(String userEmail, String action, String ressourceType, Long ressourceId, String details) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail).orElse(null);
        if (utilisateur != null) {
            Activite activite = new Activite();
            activite.setUtilisateur(utilisateur);
            activite.setAction(action);
            activite.setRessourceType(ressourceType);
            activite.setRessourceId(ressourceId);
            activite.setDetails(details);
            activiteRepository.save(activite);
        }
    }
}