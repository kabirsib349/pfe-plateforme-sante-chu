package com.pfe.backend.controller;

import com.pfe.backend.dto.ReponseFormulaireRequest;
import com.pfe.backend.model.OptionValeur;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.service.ReponseFormulaireService;
import com.pfe.backend.service.CsvExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion des réponses aux formulaires.
 * Permet la saisie des réponses, la consultation par patient et l'exportation des données.
 */
@RestController
@RequestMapping("/api/reponses")
@RequiredArgsConstructor
public class ReponseFormulaireController {

    private final ReponseFormulaireService reponseFormulaireService;
    private final CsvExportService csvExportService;

    /**
     * Enregistre les réponses saisies pour un formulaire donné.
     *
     * @param request données des réponses (formulaire, patient, valeurs)
     * @param principal utilisateur connecté (médecin ou chercheur)
     * @return statut 200 OK
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('medecin','chercheur')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Void> sauvegarderReponses(
            @RequestBody ReponseFormulaireRequest request,
            @RequestParam(defaultValue = "false") boolean brouillon,
            Principal principal) {
        reponseFormulaireService.sauvegarderReponses(request, principal.getName(), brouillon);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/marquer-lu/{formulaireMedecinId}")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<Void> marquerCommeLu(
            @PathVariable Long formulaireMedecinId,
            Principal principal) {
        reponseFormulaireService.marquerCommeLu(formulaireMedecinId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{formulaireMedecinId}")
    public ResponseEntity<List<ReponseFormulaire>> getReponses(@PathVariable Long formulaireMedecinId) {
        List<ReponseFormulaire> reponses = reponseFormulaireService.getReponses(formulaireMedecinId);
        return ResponseEntity.ok(reponses);
    }
    
    @GetMapping("/{formulaireMedecinId}/patient/{patientIdentifier}")
    public ResponseEntity<List<ReponseFormulaire>> getReponsesByPatient(
            @PathVariable Long formulaireMedecinId,
            @PathVariable String patientIdentifier) {
        List<ReponseFormulaire> reponses = reponseFormulaireService.getReponsesByPatient(
                formulaireMedecinId, 
                patientIdentifier
        );
        return ResponseEntity.ok(reponses);
    }
    
    @GetMapping("/{formulaireMedecinId}/patients")
    public ResponseEntity<List<String>> getPatientIdentifiers(@PathVariable Long formulaireMedecinId) {
        List<String> patients = reponseFormulaireService.getPatientIdentifiers(formulaireMedecinId);
        return ResponseEntity.ok(patients);
    }
    


    @DeleteMapping("/{formulaireMedecinId}")
    @PreAuthorize("hasAnyAuthority('medecin','chercheur')")
    public ResponseEntity<Void> supprimerToutesReponses(
            @PathVariable Long formulaireMedecinId,
            Principal principal) {
        reponseFormulaireService.supprimerToutesReponsesFormulaire(
                formulaireMedecinId,
                principal.getName()
        );
        return ResponseEntity.ok().build();
    }

    /**
     * Supprime les réponses d'un patient spécifique.
     */
    @DeleteMapping("/{formulaireMedecinId}/patient/{patientIdentifier}")
    @PreAuthorize("hasAnyAuthority('medecin','chercheur')")
    public ResponseEntity<Void> supprimerReponsesPatient(
            @PathVariable Long formulaireMedecinId,
            @PathVariable String patientIdentifier,
            Principal principal) {
        reponseFormulaireService.supprimerReponsesPatient(
                formulaireMedecinId,
                patientIdentifier,
                principal.getName()
        );
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{formulaireMedecinId}/statistiques")
    @PreAuthorize("hasAnyAuthority('medecin','chercheur')")
    public ResponseEntity<com.pfe.backend.dto.StatistiqueFormulaireDto> getStatistiques(
            @PathVariable Long formulaireMedecinId) {
        com.pfe.backend.dto.StatistiqueFormulaireDto stats = reponseFormulaireService.getStatistiques(formulaireMedecinId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{formulaireMedecinId}/drafts")
    @PreAuthorize("hasAnyAuthority('medecin','chercheur')")
    public ResponseEntity<List<Map<String, Object>>> getAllDrafts(
            @PathVariable Long formulaireMedecinId) {
        List<Map<String, Object>> drafts = reponseFormulaireService.getAllDraftsForFormulaire(formulaireMedecinId);
        return ResponseEntity.ok(drafts);
    }

    @GetMapping("/{formulaireMedecinId}/draft/{patientIdentifier}")
    @PreAuthorize("hasAnyAuthority('medecin','chercheur')")
    public ResponseEntity<Map<String, Object>> getDraftForPatient(
            @PathVariable Long formulaireMedecinId,
            @PathVariable String patientIdentifier) {
        Map<String, Object> draft = reponseFormulaireService.getDraftForPatient(formulaireMedecinId, patientIdentifier);
        if (draft == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(draft);
    }


    /**
     * Exporte les données d'un formulaire au format CSV.
     * Les données sont anonymisées et structurées par catégories.
     *
     * @param formulaireMedecinId identifiant de l'envoi
     * @return fichier CSV à télécharger
     */
    @GetMapping("/export/{formulaireMedecinId}")
    public ResponseEntity<InputStreamResource> exportCSV(@PathVariable Long formulaireMedecinId) {
        List<ReponseFormulaire> reponses = reponseFormulaireService.getReponses(formulaireMedecinId);
        
        String csvContent = csvExportService.generateCsvContent(reponses);
        byte[] csvBytes = addUtf8Bom(csvContent);
        ByteArrayInputStream inputStream = new ByteArrayInputStream(csvBytes);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=formulaire_" + formulaireMedecinId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(new InputStreamResource(inputStream));
    }

    private byte[] addUtf8Bom(String content) {
        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] data = content.getBytes(StandardCharsets.UTF_8);
        byte[] result = new byte[bom.length + data.length];

        System.arraycopy(bom, 0, result, 0, bom.length);
        System.arraycopy(data, 0, result, bom.length, data.length);

        return result;
    }

}
