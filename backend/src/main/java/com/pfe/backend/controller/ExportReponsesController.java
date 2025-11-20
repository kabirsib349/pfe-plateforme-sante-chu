package com.pfe.backend.controller;

import com.pfe.backend.service.ExportReponsesService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * @brief Contrôleur REST pour l'export CSV des réponses d'un formulaire médecin.
 * @date 20/11/2025
 */
@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExportReponsesController {

    private final ExportReponsesService exportReponsesService;

    /**
     * @brief Exporte en CSV les réponses d'un formulaire rempli par un médecin.
     * @param formulaireMedecinId Identifiant du formulaire médecin.
     * @param principal Utilisateur connecté (chercheur).
     * @return ResponseEntity Fichier CSV en pièce jointe.
     * @date 20/11/2025
     */
    @GetMapping("/formulaires-medecins/{formulaireMedecinId}/csv")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<ByteArrayResource> exporterReponsesCsv(
            @PathVariable Long formulaireMedecinId,
            Principal principal) {

        ByteArrayResource resource =
                exportReponsesService.exporterReponsesCsv(formulaireMedecinId, principal.getName());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("formulaire_medecin_" + formulaireMedecinId + ".csv")
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }
}
