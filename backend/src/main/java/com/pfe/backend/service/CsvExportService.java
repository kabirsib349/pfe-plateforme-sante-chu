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

    // Category name constants
    private static final String CAT_IDENTITE_PATIENT = "IDENTITE PATIENT";
    private static final String CAT_ANTECEDENTS = "ANTECEDENTS";
    private static final String CAT_SEJOUR_HOPITAL = "SEJOUR HOPITAL";
    private static final String CAT_CONSULTATION = "CONSULTATION";
    private static final String CAT_BILAN_PRE_OP = "BILAN PRE OPERATOIRE";
    private static final String CAT_PER_OP = "PER OPERATOIRE";
    private static final String CAT_POST_OP = "POST OPERATOIRE";
    private static final String CAT_TRANSFUSION = "TRANSFUSION";
    private static final String CAT_RECUPERATION = "RECUPERATION";
    private static final String CAT_COMPLICATIONS = "COMPLICATIONS";
    private static final String CAT_AUTRE = "AUTRE";

    private static final Map<String, String> CATEGORY_MAPPING = Map.ofEntries(
            Map.entry("Sexe", CAT_IDENTITE_PATIENT),
            Map.entry("Age", CAT_IDENTITE_PATIENT),
            Map.entry("Taille", CAT_IDENTITE_PATIENT),
            Map.entry("Poids", CAT_IDENTITE_PATIENT),
            Map.entry("IMC", CAT_IDENTITE_PATIENT),
            Map.entry("ASA", CAT_IDENTITE_PATIENT),
            Map.entry("Type de chirurgie prevue", CAT_IDENTITE_PATIENT),

            Map.entry("Traitement antiplaquettaire", CAT_ANTECEDENTS),
            Map.entry("Nom du traitement antiplaquettaire le cas échéant", CAT_ANTECEDENTS),
            Map.entry("Traitement Beta-bloquant", CAT_ANTECEDENTS),
            Map.entry("Nom du traitement beta-bloquant le cas échéant", CAT_ANTECEDENTS),
            Map.entry("Chimiothérapie", CAT_ANTECEDENTS),
            Map.entry("Nom de la chimiothérapie le cas échéant", CAT_ANTECEDENTS),
            Map.entry("Autres traitements habituels", CAT_ANTECEDENTS),
            Map.entry("Nom des autres traitements le cas échéant", CAT_ANTECEDENTS),
            Map.entry("Antécédents cardiovasculaires", CAT_ANTECEDENTS),

            Map.entry("Lieu avant le séjour à l'hôpital", CAT_SEJOUR_HOPITAL),
            Map.entry("Date d'entrée à l'hôpital", CAT_SEJOUR_HOPITAL),
            Map.entry("Lieu après le séjour à l'hôpital", CAT_SEJOUR_HOPITAL),
            Map.entry("Parcours RAAC", CAT_SEJOUR_HOPITAL),

            Map.entry("Consultation de chirurgie", CAT_CONSULTATION),
            Map.entry("Consultation d'anesthésie", CAT_CONSULTATION),

            Map.entry("Bilan", CAT_BILAN_PRE_OP),
            Map.entry("Ferritine", CAT_BILAN_PRE_OP),
            Map.entry("Fréquence cardiaque", CAT_BILAN_PRE_OP),
            Map.entry("Température corporelle", CAT_BILAN_PRE_OP),
            Map.entry("Échelle de douleur", CAT_BILAN_PRE_OP),

            Map.entry("Type d'anesthésie", CAT_PER_OP),
            Map.entry("Durée de l'intervention", CAT_PER_OP),
            Map.entry("Complications per-opératoires", CAT_PER_OP),

            Map.entry("Date de sortie de salle de réveil", CAT_POST_OP),
            Map.entry("Score de douleur à la sortie", CAT_POST_OP),
            Map.entry("Antalgiques administrés", CAT_POST_OP),

            Map.entry("Transfusion per-opératoire", CAT_TRANSFUSION),
            Map.entry("Nombre de culots globulaires", CAT_TRANSFUSION),
            Map.entry("Transfusion post-opératoire", CAT_TRANSFUSION),

            Map.entry("Date correspondant au J1 de la chirurgie", CAT_RECUPERATION),
            Map.entry("Date de fin du traitement antiplaquettaire", CAT_RECUPERATION),
            Map.entry("Distance marchée au J3", CAT_RECUPERATION),

            Map.entry("Complications infectieuses", CAT_COMPLICATIONS),
            Map.entry("Complications thromboemboliques", CAT_COMPLICATIONS),
            Map.entry("Réadmission sous 30 jours", CAT_COMPLICATIONS)
    );

    private static final List<String> CATEGORY_ORDER = List.of(
            CAT_IDENTITE_PATIENT,
            CAT_ANTECEDENTS,
            CAT_SEJOUR_HOPITAL,
            CAT_CONSULTATION,
            CAT_BILAN_PRE_OP,
            CAT_PER_OP,
            CAT_POST_OP,
            CAT_TRANSFUSION,
            CAT_RECUPERATION,
            CAT_COMPLICATIONS,
            CAT_AUTRE
    );

    /**
     * Génère le contenu CSV à partir des réponses.
     */
    public String generateCsvContent(List<ReponseFormulaire> reponses) {
        if (reponses == null || reponses.isEmpty()) {
            return "";
        }
        
        Map<String, List<ReponseFormulaire>> reponsesParPatient = groupByPatient(reponses);
        List<ReponseFormulaire> tousLesChamps = getSortedUniqueFields(reponses);
        
        if (tousLesChamps.isEmpty()) {
            return "";
        }
        
        StringBuilder csv = new StringBuilder();
        appendCategoryHeader(csv, tousLesChamps);
        appendFieldLabelsHeader(csv, tousLesChamps);
        appendDataRows(csv, reponsesParPatient, tousLesChamps);
        
        return csv.toString();
    }

    /**
     * Groups responses by patient identifier.
     * Uses patientIdentifierHash if available, otherwise falls back to patientIdentifier,
     * or generates a unique identifier based on response ID.
     */
    private Map<String, List<ReponseFormulaire>> groupByPatient(List<ReponseFormulaire> reponses) {
        java.util.concurrent.atomic.AtomicInteger unknownCounter = new java.util.concurrent.atomic.AtomicInteger(0);
        
        return reponses.stream()
                .collect(Collectors.groupingBy(r -> getPatientKey(r, unknownCounter)));
    }
    
    /**
     * Gets the patient key for grouping.
     * Priority: patientIdentifierHash > patientIdentifier > generated ID
     */
    private String getPatientKey(ReponseFormulaire reponse, java.util.concurrent.atomic.AtomicInteger unknownCounter) {
        if (reponse.getPatientIdentifierHash() != null && !reponse.getPatientIdentifierHash().isEmpty()) {
            return reponse.getPatientIdentifierHash();
        }
        if (reponse.getPatientIdentifier() != null && !reponse.getPatientIdentifier().isEmpty()) {
            return "ID_" + reponse.getPatientIdentifier();
        }
        // Fallback: group by response ID to ensure data is not lost
        return "UNKNOWN_" + unknownCounter.incrementAndGet();
    }

    private List<ReponseFormulaire> getSortedUniqueFields(List<ReponseFormulaire> reponses) {
        return reponses.stream()
                .filter(r -> r.getChamp() != null && r.getChamp().getIdChamp() != null)
                .collect(Collectors.toMap(
                        r -> r.getChamp().getIdChamp(),
                        r -> r,
                        (r1, r2) -> r1
                ))
                .values()
                .stream()
                .filter(r -> r.getChamp().getLabel() != null)
                .sorted(this::compareByCategory)
                .toList();
    }

    private int compareByCategory(ReponseFormulaire r1, ReponseFormulaire r2) {
        String cat1 = getCategory(r1);
        String cat2 = getCategory(r2);
        int catCompare = Integer.compare(CATEGORY_ORDER.indexOf(cat1), CATEGORY_ORDER.indexOf(cat2));
        return catCompare != 0 ? catCompare : r1.getChamp().getLabel().compareTo(r2.getChamp().getLabel());
    }

    private String getCategory(ReponseFormulaire reponse) {
        return CATEGORY_MAPPING.getOrDefault(reponse.getChamp().getLabel(), CAT_AUTRE);
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
        csv.append("NUMERO_INCLUSION;");
        for (ReponseFormulaire r : tousLesChamps) {
            csv.append(r.getChamp().getLabel()).append(";");
        }
        csv.append("\n");
    }

    private void appendDataRows(StringBuilder csv, Map<String, List<ReponseFormulaire>> reponsesParPatient,
                                 List<ReponseFormulaire> tousLesChamps) {
        // Trier les patients par numéro d'inclusion croissant
        List<Map.Entry<String, List<ReponseFormulaire>>> sortedEntries = reponsesParPatient.entrySet().stream()
                .sorted((e1, e2) -> {
                    int num1 = parseNumeroInclusion(e1.getValue());
                    int num2 = parseNumeroInclusion(e2.getValue());
                    return Integer.compare(num1, num2);
                })
                .toList();
        
        for (Map.Entry<String, List<ReponseFormulaire>> entry : sortedEntries) {
            appendPatientRow(csv, entry.getValue(), tousLesChamps);
        }
    }

    /**
     * Parse le numéro d'inclusion pour le tri.
     */
    private int parseNumeroInclusion(List<ReponseFormulaire> reponsesPatient) {
        if (reponsesPatient == null || reponsesPatient.isEmpty()) {
            return Integer.MAX_VALUE;
        }
        String patientId = reponsesPatient.get(0).getPatientIdentifier();
        if (patientId == null) return Integer.MAX_VALUE;
        
        int lastDash = patientId.lastIndexOf('-');
        if (lastDash >= 0 && lastDash < patientId.length() - 1) {
            try {
                return Integer.parseInt(patientId.substring(lastDash + 1));
            } catch (NumberFormatException e) {
                return Integer.MAX_VALUE;
            }
        }
        return Integer.MAX_VALUE;
    }


    private void appendPatientRow(StringBuilder csv, List<ReponseFormulaire> reponsesPatient,
                                   List<ReponseFormulaire> tousLesChamps) {
        // Ajouter le numéro d'inclusion en première colonne
        String numeroInclusion = extractNumeroInclusion(reponsesPatient);
        csv.append(numeroInclusion).append(";");
        
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

    /**
     * Extrait le numéro d'inclusion (partie numérique) du patientIdentifier.
     * Format attendu: NOM-PRENOM-ETUDE-XXXX -> retourne le numéro sans zéros devant
     */
    private String extractNumeroInclusion(List<ReponseFormulaire> reponsesPatient) {
        if (reponsesPatient == null || reponsesPatient.isEmpty()) {
            return "";
        }
        
        String patientId = reponsesPatient.get(0).getPatientIdentifier();
        if (patientId == null || patientId.isEmpty()) {
            return "";
        }
        
        // Extraire la dernière partie après le dernier tiret (le numéro)
        int lastDash = patientId.lastIndexOf('-');
        if (lastDash >= 0 && lastDash < patientId.length() - 1) {
            String numPart = patientId.substring(lastDash + 1);
            try {
                // Convertir en entier pour enlever les zéros devant
                return String.valueOf(Integer.parseInt(numPart));
            } catch (NumberFormatException e) {
                return numPart;
            }
        }
        
        return patientId;
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
