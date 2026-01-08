package com.pfe.backend.controller;

import com.pfe.backend.model.Activite;
import com.pfe.backend.repository.ActiviteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

/**
 * Contrôleur REST pour le tableau de bord.
 * Fournit les données d'activité récente de l'utilisateur.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ActiviteRepository activiteRepository;

    /**
     * Récupère les activités récentes pour l'utilisateur connecté.
     *
     * @param principal utilisateur connecté
     * @param limit nombre maximum d'activités à récupérer (par défaut 10)
     * @return liste des activités récentes
     */
    @GetMapping("/activity")
    public ResponseEntity<List<Activite>> getRecentActivity(
            Principal principal,
            @RequestParam(defaultValue = "10") int limit) {
        List<Activite> activities = activiteRepository.findRecentByUserEmail(principal.getName(), limit);
        return ResponseEntity.ok(activities);
    }

    /**
     * Récupère l'historique complet des activités de l'utilisateur.
     *
     * @param principal utilisateur connecté
     * @return liste de toutes les activités
     */
    @GetMapping("/activity/all")
    public ResponseEntity<List<Activite>> getAllActivity(Principal principal) {
        List<Activite> activities = activiteRepository.findByUserEmailOrderByDateDesc(principal.getName());
        return ResponseEntity.ok(activities);
    }
}