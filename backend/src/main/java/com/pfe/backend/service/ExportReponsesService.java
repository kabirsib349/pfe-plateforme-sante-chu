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
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé"));

        verifierAutorisation(formulaire, emailChercheur);

        List<Champ> champs = formulaire.getChamps();
        List<ReponseFormulaire> reponses = reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId);
        
        // Null checks
        if (champs == null) {
            champs = java.util.Collections.emptyList();
        }
        if (reponses == null) {
            reponses = java.util.Collections.emptyList();
        }

        Map<String, List<ReponseFormulaire>> reponsesParPatient = grouperReponsesParPatient(reponses);

        StringBuilder csv = new StringBuilder();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        construireEnteteCsv(csv, champs);
        construireLignesPatients(csv, reponsesParPatient, champs, dateFormatter);

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        return new ByteArrayResource(bytes);
    }

    private void verifierAutorisation(Formulaire formulaire, String emailChercheur) {
        if (formulaire.getChercheur() == null ||
                !formulaire.getChercheur().getEmail().equals(emailChercheur)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à exporter ce formulaire");
        }
    }

    private Map<String, List<ReponseFormulaire>> grouperReponsesParPatient(List<ReponseFormulaire> reponses) {
        return reponses.stream()
                .filter(r -> r.getPatientIdentifierHash() != null)
                .collect(Collectors.groupingBy(ReponseFormulaire::getPatientIdentifierHash));
    }

    private void construireEnteteCsv(StringBuilder csv, List<Champ> champs) {
        csv.append("Patient_ID");
        for (Champ champ : champs) {
            String nomVariable = champ.getLabel() != null 
                ? champ.getLabel().toUpperCase().replaceAll("\\s+", "_") 
                : "CHAMP_" + champ.getIdChamp();
            csv.append(";").append(escapeCsv(nomVariable));
        }
        csv.append(";Date_Saisie\n");
    }

    private void construireLignesPatients(StringBuilder csv, Map<String, List<ReponseFormulaire>> reponsesParPatient,
                                          List<Champ> champs, DateTimeFormatter dateFormatter) {
        for (Map.Entry<String, List<ReponseFormulaire>> entry : reponsesParPatient.entrySet()) {
            construireLignePatient(csv, entry.getKey(), entry.getValue(), champs, dateFormatter);
        }
    }

    private void construireLignePatient(StringBuilder csv, String patientHash, List<ReponseFormulaire> reponsesPatient,
                                        List<Champ> champs, DateTimeFormatter dateFormatter) {
        Map<Long, ReponseFormulaire> reponsesParChamp = creerMapReponsesParChamp(reponsesPatient);
        
        csv.append(escapeCsv(patientHash));

        LocalDateTime dateSaisie = ajouterValeursChamps(csv, champs, reponsesParChamp);

        csv.append(";");
        if (dateSaisie != null) {
            csv.append(dateFormatter.format(dateSaisie));
        }
        csv.append("\n");
    }

    private Map<Long, ReponseFormulaire> creerMapReponsesParChamp(List<ReponseFormulaire> reponsesPatient) {
        return reponsesPatient.stream()
                .filter(r -> r.getChamp() != null)
                .collect(Collectors.toMap(
                        r -> r.getChamp().getIdChamp(),
                        r -> r,
                        (r1, r2) -> r1
                ));
    }

    private LocalDateTime ajouterValeursChamps(StringBuilder csv, List<Champ> champs,
                                                Map<Long, ReponseFormulaire> reponsesParChamp) {
        LocalDateTime dateSaisiePlusRecente = null;
        
        for (Champ champ : champs) {
            csv.append(";");
            ReponseFormulaire reponse = reponsesParChamp.get(champ.getIdChamp());
            
            if (reponse != null) {
                csv.append(escapeCsv(reponse.getValeur()));
                dateSaisiePlusRecente = trouverDatePlusRecente(dateSaisiePlusRecente, reponse.getDateSaisie());
            }
        }
        
        return dateSaisiePlusRecente;
    }

    private LocalDateTime trouverDatePlusRecente(LocalDateTime dateActuelle, LocalDateTime nouvelleDate) {
        if (dateActuelle == null) {
            return nouvelleDate;
        }
        if (nouvelleDate != null && nouvelleDate.isAfter(dateActuelle)) {
            return nouvelleDate;
        }
        return dateActuelle;
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
