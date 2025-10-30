package com.pfe.backend.service;

import com.pfe.backend.model.Activite;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.ActiviteRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActiviteService {

    private final ActiviteRepository activiteRepository;
    private final UtilisateurRepository utilisateurRepository;

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