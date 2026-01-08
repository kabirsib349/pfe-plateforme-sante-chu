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
     * @brief Exporte en CSV les réponses d'un formualaire
     * @param formulaireId Identifiant du formulaire.
     * @param principal Utilisateur connecté
     * @return ResponseEntity Fichier CSV en pièce jointe.
     * @date 18/12/2025
     */
    @GetMapping("/formulaires/{formulaireId}/csv")
    @PreAuthorize("hasAuthority('chercheur')")
    public ResponseEntity<ByteArrayResource> exporterReponsesCsv(
            @PathVariable Long formulaireId,
            Principal principal) {

        ByteArrayResource resource =
                exportReponsesService.exporterReponsesCsv(formulaireId, principal.getName());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("formulaire_" + formulaireId + "_reponses.csv")
                        .build()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }
}
