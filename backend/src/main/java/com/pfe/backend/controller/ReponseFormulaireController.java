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

/**
 * Contrôleur REST pour la gestion des réponses aux formulaires.
 * Permet la saisie des réponses, la consultation par patient et l'exportation des données.
 */
@RestController
@RequestMapping("/api/reponses")
@RequiredArgsConstructor
public class ReponseFormulaireController {

    private final ReponseFormulaireService reponseFormulaireService;

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

        // Mapping des labels → catégories 
        Map<String, String> mappingCategories = Map.ofEntries(
                Map.entry("Sexe", "IDENTITE PATIENT"),
                Map.entry("Age", "IDENTITE PATIENT"),
                Map.entry("Taille", "IDENTITE PATIENT"),
                Map.entry("Poids", "IDENTITE PATIENT"),
                Map.entry("IMC", "IDENTITE PATIENT"),
                Map.entry("ASA", "IDENTITE PATIENT"),
                Map.entry("Type de chirurgie prevue", "IDENTITE PATIENT"),

                Map.entry("Traitement antiplaquettaire", "ANTECEDENTS"),
                Map.entry("Nom du traitement antiplaquettaire le cas échéant", "ANTECEDENTS"),
                Map.entry("Traitement Beta-bloquant", "ANTECEDENTS"),
                Map.entry("Nom du traitement beta-bloquant le cas échéant", "ANTECEDENTS"),
                Map.entry("Chimiothérapie", "ANTECEDENTS"),
                Map.entry("Nom de la chimiothérapie le cas échéant", "ANTECEDENTS"),
                Map.entry("Autres traitements habituels", "ANTECEDENTS"),
                Map.entry("Nom des autres traitements le cas échéant", "ANTECEDENTS"),
                Map.entry("Antécédents cardiovasculaires", "ANTECEDENTS"),

                Map.entry("Lieu avant le séjour à l'hôpital", "SEJOUR HOPITAL"),
                Map.entry("Date d'entrée à l'hôpital", "SEJOUR HOPITAL"),
                Map.entry("Lieu après le séjour à l'hôpital", "SEJOUR HOPITAL"),
                Map.entry("Parcours RAAC", "SEJOUR HOPITAL"),

                Map.entry("Consultation de chirurgie", "CONSULTATION"),
                Map.entry("Consultation d'anesthésie", "CONSULTATION"),

                Map.entry("Bilan", "BILAN PRE OPERATOIRE"),
                Map.entry("Ferritine", "BILAN PRE OPERATOIRE"),
                Map.entry("Fréquence cardiaque", "BILAN PRE OPERATOIRE"),
                Map.entry("Température corporelle", "BILAN PRE OPERATOIRE"),
                Map.entry("Échelle de douleur", "BILAN PRE OPERATOIRE"),

                Map.entry("Type d'anesthésie", "PER OPERATOIRE"),
                Map.entry("Durée de l'intervention", "PER OPERATOIRE"),
                Map.entry("Complications per-opératoires", "PER OPERATOIRE"),

                Map.entry("Date de sortie de salle de réveil", "POST OPERATOIRE"),
                Map.entry("Score de douleur à la sortie", "POST OPERATOIRE"),
                Map.entry("Antalgiques administrés", "POST OPERATOIRE"),

                Map.entry("Transfusion per-opératoire", "TRANSFUSION"),
                Map.entry("Nombre de culots globulaires", "TRANSFUSION"),
                Map.entry("Transfusion post-opératoire", "TRANSFUSION"),

                Map.entry("Date correspondant au J1 de la chirurgie", "RECUPERATION"),
                Map.entry("Date de fin du traitement antiplaquettaire", "RECUPERATION"),
                Map.entry("Distance marchée au J3", "RECUPERATION"),

                Map.entry("Complications infectieuses", "COMPLICATIONS"),
                Map.entry("Complications thromboemboliques", "COMPLICATIONS"),
                Map.entry("Réadmission sous 30 jours", "COMPLICATIONS")
        );
        
        // Ordre des catégories
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

        // Grouper les réponses par patient
        Map<String, List<ReponseFormulaire>> reponsesParPatient = reponses.stream()
                .filter(r -> r.getPatientIdentifierHash() != null)
                .collect(Collectors.groupingBy(ReponseFormulaire::getPatientIdentifierHash));

        // Créer une liste ordonnée de tous les champs (pour l'en-tête)
        List<ReponseFormulaire> tousLesChamps = reponses.stream()
                .collect(Collectors.toMap(
                        r -> r.getChamp().getIdChamp(),
                        r -> r,
                        (r1, r2) -> r1
                ))
                .values()
                .stream()
                .sorted((r1, r2) -> {
                    String cat1 = mappingCategories.getOrDefault(r1.getChamp().getLabel(), "AUTRE");
                    String cat2 = mappingCategories.getOrDefault(r2.getChamp().getLabel(), "AUTRE");
                    int catCompare = Integer.compare(ordreCategories.indexOf(cat1), ordreCategories.indexOf(cat2));
                    return catCompare != 0 ? catCompare : r1.getChamp().getLabel().compareTo(r2.getChamp().getLabel());
                })
                .collect(Collectors.toList());

        StringBuilder csv = new StringBuilder();

        // Première ligne : blocs de catégories
        String currentCat = "";
        int countInCat = 0;
        for (ReponseFormulaire r : tousLesChamps) {
            String cat = mappingCategories.getOrDefault(r.getChamp().getLabel(), "AUTRE");
            if (!cat.equals(currentCat)) {
                if (countInCat > 0) {
                    csv.append(currentCat).append(";".repeat(Math.max(0, countInCat)));
                }
                currentCat = cat;
                countInCat = 0;
            }
            countInCat++;
        }
        if (countInCat > 0) {
            csv.append(currentCat).append(";".repeat(Math.max(0, countInCat)));
        }
        csv.append("\n");

        // Deuxième ligne : labels des champs
        for (ReponseFormulaire r : tousLesChamps) {
            csv.append(r.getChamp().getLabel()).append(";");
        }
        csv.append("\n");

        // Lignes de données : une ligne par patient
        for (Map.Entry<String, List<ReponseFormulaire>> entry : reponsesParPatient.entrySet()) {
            List<ReponseFormulaire> reponsesPatient = entry.getValue();
            
            // Créer une map champId -> ReponseFormulaire pour ce patient
            Map<Long, ReponseFormulaire> reponsesParChamp = reponsesPatient.stream()
                    .collect(Collectors.toMap(
                            r -> r.getChamp().getIdChamp(),
                            r -> r,
                            (r1, r2) -> r1
                    ));

            // Pour chaque champ dans l'ordre, ajouter la valeur ou vide
            for (ReponseFormulaire champRef : tousLesChamps) {
                ReponseFormulaire reponse = reponsesParChamp.get(champRef.getChamp().getIdChamp());
                
                if (reponse != null) {
                    String valeur = reponse.getValeur();
                    
                    // Choix multiples → libellé visible
                    if (reponse.getChamp().getListeValeur() != null &&
                            reponse.getChamp().getListeValeur().getOptions() != null) {
                        valeur = reponse.getChamp().getListeValeur().getOptions().stream()
                                .filter(o -> o.getValeur() != null &&
                                        o.getValeur().equals(reponse.getValeur()))
                                .map(OptionValeur::getLibelle)
                                .findFirst()
                                .orElse(valeur);
                    }
                    
                    csv.append(valeur != null ? valeur : "").append(";");
                } else {
                    csv.append(";");
                }
            }
            csv.append("\n");
        }

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
