package com.pfe.backend.service;

import com.pfe.backend.model.OptionValeur;
import com.pfe.backend.model.ReponseFormulaire;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service pour l'export CSV des réponses aux formulaires.
 * Extrait la logique complexe d'export pour réduire la complexité cognitive.
 */
@Service
public class CsvExportService {

    private static final Map<String, String> CATEGORY_MAPPING = Map.ofEntries(
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

    private static final List<String> CATEGORY_ORDER = List.of(
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

    /**
     * Génère le contenu CSV à partir des réponses.
     */
    public String generateCsvContent(List<ReponseFormulaire> reponses) {
        Map<String, List<ReponseFormulaire>> reponsesParPatient = groupByPatient(reponses);
        List<ReponseFormulaire> tousLesChamps = getSortedUniqueFields(reponses);
        
        StringBuilder csv = new StringBuilder();
        appendCategoryHeader(csv, tousLesChamps);
        appendFieldLabelsHeader(csv, tousLesChamps);
        appendDataRows(csv, reponsesParPatient, tousLesChamps);
        
        return csv.toString();
    }

    private Map<String, List<ReponseFormulaire>> groupByPatient(List<ReponseFormulaire> reponses) {
        return reponses.stream()
                .filter(r -> r.getPatientIdentifierHash() != null)
                .collect(Collectors.groupingBy(ReponseFormulaire::getPatientIdentifierHash));
    }

    private List<ReponseFormulaire> getSortedUniqueFields(List<ReponseFormulaire> reponses) {
        return reponses.stream()
                .collect(Collectors.toMap(
                        r -> r.getChamp().getIdChamp(),
                        r -> r,
                        (r1, r2) -> r1
                ))
                .values()
                .stream()
                .sorted(this::compareByCategory)
                .collect(Collectors.toList());
    }

    private int compareByCategory(ReponseFormulaire r1, ReponseFormulaire r2) {
        String cat1 = getCategory(r1);
        String cat2 = getCategory(r2);
        int catCompare = Integer.compare(CATEGORY_ORDER.indexOf(cat1), CATEGORY_ORDER.indexOf(cat2));
        return catCompare != 0 ? catCompare : r1.getChamp().getLabel().compareTo(r2.getChamp().getLabel());
    }

    private String getCategory(ReponseFormulaire reponse) {
        return CATEGORY_MAPPING.getOrDefault(reponse.getChamp().getLabel(), "AUTRE");
    }

    private void appendCategoryHeader(StringBuilder csv, List<ReponseFormulaire> tousLesChamps) {
        String currentCat = "";
        int countInCat = 0;
        
        for (ReponseFormulaire r : tousLesChamps) {
            String cat = getCategory(r);
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
    }

    private void appendFieldLabelsHeader(StringBuilder csv, List<ReponseFormulaire> tousLesChamps) {
        for (ReponseFormulaire r : tousLesChamps) {
            csv.append(r.getChamp().getLabel()).append(";");
        }
        csv.append("\n");
    }

    private void appendDataRows(StringBuilder csv, Map<String, List<ReponseFormulaire>> reponsesParPatient,
                                 List<ReponseFormulaire> tousLesChamps) {
        for (Map.Entry<String, List<ReponseFormulaire>> entry : reponsesParPatient.entrySet()) {
            appendPatientRow(csv, entry.getValue(), tousLesChamps);
        }
    }

    private void appendPatientRow(StringBuilder csv, List<ReponseFormulaire> reponsesPatient,
                                   List<ReponseFormulaire> tousLesChamps) {
        Map<Long, ReponseFormulaire> reponsesParChamp = reponsesPatient.stream()
                .collect(Collectors.toMap(
                        r -> r.getChamp().getIdChamp(),
                        r -> r,
                        (r1, r2) -> r1
                ));

        for (ReponseFormulaire champRef : tousLesChamps) {
            ReponseFormulaire reponse = reponsesParChamp.get(champRef.getChamp().getIdChamp());
            String cellValue = getFormattedCellValue(reponse);
            csv.append(cellValue).append(";");
        }
        csv.append("\n");
    }

    private String getFormattedCellValue(ReponseFormulaire reponse) {
        if (reponse == null) {
            return "";
        }

        String valeur = reponse.getValeur();
        
        if (hasOptions(reponse)) {
            valeur = convertValueToLabel(reponse, valeur);
        }
        
        return valeur != null ? valeur : "";
    }

    private boolean hasOptions(ReponseFormulaire reponse) {
        return reponse.getChamp().getListeValeur() != null &&
               reponse.getChamp().getListeValeur().getOptions() != null;
    }

    private String convertValueToLabel(ReponseFormulaire reponse, String defaultValue) {
        return reponse.getChamp().getListeValeur().getOptions().stream()
                .filter(o -> isMatchingOption(o, reponse.getValeur()))
                .map(OptionValeur::getLibelle)
                .findFirst()
                .orElse(defaultValue);
    }

    private boolean isMatchingOption(OptionValeur option, String value) {
        return option.getValeur() != null && option.getValeur().equals(value);
    }
}
