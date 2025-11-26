package com.pfe.backend.controller;

import com.pfe.backend.dto.ReponseFormulaireRequest;
import com.pfe.backend.model.OptionValeur;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.service.ReponseFormulaireService;
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

@RestController
@RequestMapping("/api/reponses")
@RequiredArgsConstructor
public class ReponseFormulaireController {

    private final ReponseFormulaireService reponseFormulaireService;

    @PostMapping
    @PreAuthorize("hasAuthority('medecin')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Void> sauvegarderReponses(
            @RequestBody ReponseFormulaireRequest request,
            Principal principal) {
        reponseFormulaireService.sauvegarderReponses(request, principal.getName());
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
    
    @DeleteMapping("/{formulaireMedecinId}/patient/{patientIdentifier}")
    @PreAuthorize("hasAuthority('medecin')")
    public ResponseEntity<Void> supprimerReponsesPatient(
            @PathVariable Long formulaireMedecinId,
            @PathVariable String patientIdentifier,
            Principal principal) {
        reponseFormulaireService.supprimerReponsesPatient(
                formulaireMedecinId, 
                patientIdentifier, 
                principal.getName()
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export/{formulaireMedecinId}")
    public ResponseEntity<InputStreamResource> exportCSV(@PathVariable Long formulaireMedecinId) {

        List<ReponseFormulaire> reponses = reponseFormulaireService.getReponses(formulaireMedecinId);

        // 🔹 Ordre des catégories
        List<String> ordreCategories = List.of(
                "IDENTITE PATIENT",
                "ANTECEDENTS",
                "SEJOUR HOPITAL",
                "CONSULTATION",
                "BILAN PRE OPERATOIRE",
                "PER OPERATOIRE",
                "POST OPERATOIRE",
                "TRANSFUSION",
                "RECUPERATION",
                "COMPLICATIONS",
                "AUTRE"
        );

        // 🔹 Regrouper par catégorie
        Map<String, List<ReponseFormulaire>> groupes = reponses.stream()
                .collect(Collectors.groupingBy(r -> {
                    String cat = r.getChamp().getCategorie();
                    return (cat == null || cat.isBlank()) ? "AUTRE" : cat.toUpperCase();
                }));

        StringBuilder csv = new StringBuilder();

        // 🔹 Première ligne : blocs de catégories
        for (String categorie : ordreCategories) {
            if (groupes.containsKey(categorie)) {
                int nbChamps = groupes.get(categorie).size();
                csv.append(categorie).append(";".repeat(Math.max(0, nbChamps)));
            }
        }
        csv.append("\n");

        // 🔹 Deuxième ligne : labels
        for (String categorie : ordreCategories) {
            if (groupes.containsKey(categorie)) {
                for (ReponseFormulaire r : groupes.get(categorie)) {
                    csv.append(r.getChamp().getLabel()).append(";");
                }
            }
        }
        csv.append("\n");

        // 🔹 Troisième ligne : valeurs
        for (String categorie : ordreCategories) {
            if (groupes.containsKey(categorie)) {
                for (ReponseFormulaire r : groupes.get(categorie)) {

                    String valeur = r.getValeur();

                    // Choix multiples → libellé visible
                    if (r.getChamp().getListeValeur() != null &&
                            r.getChamp().getListeValeur().getOptions() != null) {

                        valeur = r.getChamp().getListeValeur().getOptions().stream()
                                .filter(o -> o.getValeur() != null &&
                                        o.getValeur().equals(r.getValeur()))
                                .map(OptionValeur::getLibelle)
                                .findFirst()
                                .orElse(valeur);
                    }

                    csv.append(valeur != null ? valeur : "").append(";");
                }
            }
        }

        // 🔹 BOM UTF-8
        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] data = csv.toString().getBytes(StandardCharsets.UTF_8);
        byte[] csvBytes = new byte[bom.length + data.length];

        System.arraycopy(bom, 0, csvBytes, 0, bom.length);
        System.arraycopy(data, 0, csvBytes, bom.length, data.length);

        ByteArrayInputStream inputStream = new ByteArrayInputStream(csvBytes);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=formulaire_" + formulaireMedecinId + ".csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(new InputStreamResource(inputStream));
    }


}
