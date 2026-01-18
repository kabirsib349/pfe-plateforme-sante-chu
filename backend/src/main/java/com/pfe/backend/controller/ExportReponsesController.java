package com.pfe.backend.controller;

import com.pfe.backend.service.ExportReponsesService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

/**
 * Contrôleur REST pour l'export CSV des réponses d'un formulaire médecin.
 */
@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportReponsesController {

    private final ExportReponsesService exportReponsesService;

    /**
     * Exporte en CSV les réponses d'un formulaire.
     *
     * @param formulaireId identifiant du formulaire
     * @param principal utilisateur connecté
     * @return fichier CSV en pièce jointe
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
