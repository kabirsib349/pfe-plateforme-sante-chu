package com.pfe.backend.service;

import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.Champ;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.repository.FormulaireRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service permettant d'exporter en CSV les réponses d'un formulaire, groupées par patient.
 */
@Service
@RequiredArgsConstructor
public class ExportReponsesService {


    private final FormulaireRepository formulaireRepository;
    private final ReponseFormulaireRepository reponseFormulaireRepository;

    /**
     * Génère un CSV contenant les réponses d'un formulaire, avec une ligne par patient.
     *
     * @param formulaireId identifiant du formulaire
     * @param emailChercheur email du chercheur demandeur
     * @return fichier CSV prêt à être téléchargé
     */
    public ByteArrayResource exporterReponsesCsv(Long formulaireId, String emailChercheur) {
        // 1. Récupérer le formulaire
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé"));

        // Vérifier que le chercheur courant est bien celui associé au formulaire
        if (formulaire.getChercheur() == null ||
                !formulaire.getChercheur().getEmail().equals(emailChercheur)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à exporter ce formulaire");
        }

        // 2. Récupérer tous les champs du formulaire (dans l'ordre)
        List<Champ> champs = formulaire.getChamps();

        // 3. Récupérer toutes les réponses pour ce formulaire
        List<ReponseFormulaire> reponses = reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId);

        // 4. Grouper les réponses par patient (patientIdentifierHash)
        Map<String, List<ReponseFormulaire>> reponsesParPatient = reponses.stream()
                .filter(r -> r.getPatientIdentifierHash() != null)
                .collect(Collectors.groupingBy(ReponseFormulaire::getPatientIdentifierHash));

        // 5. Construction du CSV
        StringBuilder sb = new StringBuilder();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // En-tête : Patient_ID + tous les champs + Date_Saisie
        sb.append("Patient_ID");
        for (Champ champ : champs) {
            String nomVariable = champ.getLabel() != null 
                ? champ.getLabel().toUpperCase().replaceAll("\\s+", "_") 
                : "CHAMP_" + champ.getIdChamp();
            sb.append(";").append(escapeCsv(nomVariable));
        }
        sb.append(";Date_Saisie\n");

        // 6. Pour chaque patient, créer une ligne
        for (Map.Entry<String, List<ReponseFormulaire>> entry : reponsesParPatient.entrySet()) {
            String patientHash = entry.getKey();
            List<ReponseFormulaire> reponsesPatient = entry.getValue();

            // Créer une map champId -> ReponseFormulaire pour ce patient
            Map<Long, ReponseFormulaire> reponsesParChamp = reponsesPatient.stream()
                    .filter(r -> r.getChamp() != null)
                    .collect(Collectors.toMap(
                            r -> r.getChamp().getIdChamp(),
                            r -> r,
                            (r1, r2) -> r1 // En cas de doublon, garder le premier
                    ));

            // Colonne Patient_ID
            sb.append(escapeCsv(patientHash));

            // Colonnes pour chaque champ
            LocalDateTime dateSaisie = null;
            for (Champ champ : champs) {
                sb.append(";");
                ReponseFormulaire reponse = reponsesParChamp.get(champ.getIdChamp());
                if (reponse != null) {
                    sb.append(escapeCsv(reponse.getValeur()));
                    // Garder la date de saisie la plus récente
                    if (dateSaisie == null || (reponse.getDateSaisie() != null && reponse.getDateSaisie().isAfter(dateSaisie))) {
                        dateSaisie = reponse.getDateSaisie();
                    }
                }
                // Sinon, laisser vide
            }

            // Colonne Date_Saisie
            sb.append(";");
            if (dateSaisie != null) {
                sb.append(dateFormatter.format(dateSaisie));
            }
            sb.append("\n");
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        return new ByteArrayResource(bytes);
    }

    private String escapeCsv(String valeur) {
        if (valeur == null) {
            return "";
        }
        if (valeur.contains(";") || valeur.contains("\"") || valeur.contains("\n")) {
            return "\"" + valeur.replace("\"", "\"\"") + "\"";
        }
        return valeur;
    }
}
