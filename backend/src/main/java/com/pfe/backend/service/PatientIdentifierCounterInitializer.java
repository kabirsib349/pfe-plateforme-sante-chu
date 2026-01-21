package com.pfe.backend.service;

import com.pfe.backend.model.PatientIdentifierCounter;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.repository.PatientIdentifierCounterRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Initialise les compteurs de patients au démarrage de l'application.
 * Analyse les réponses existantes pour éviter les conflits d'ID.
 */
@Component
@RequiredArgsConstructor
public class PatientIdentifierCounterInitializer implements CommandLineRunner {

    private final ReponseFormulaireRepository reponseFormulaireRepository;
    private final PatientIdentifierCounterRepository counterRepository;

    private static final Pattern COUNTER_PATTERN = Pattern.compile("-(\\d{4})$");

    @Override
    @Transactional
    public void run(String... args) {
        List<Long> formulaireIds = reponseFormulaireRepository.findDistinctFormulaireIds();
        
        for (Long fid : formulaireIds) {
            initializeCounterIfAbsent(fid);
        }
    }

    /**
     * Initialise le compteur pour un formulaire s'il n'existe pas déjà.
     */
    private void initializeCounterIfAbsent(Long formulaireId) {
        if (counterRepository.findByFormulaireId(formulaireId).isPresent()) {
            return;
        }

        int maxCounter = calculateMaxCounterFromResponses(formulaireId);
        createCounter(formulaireId, maxCounter + 1);
    }

    /**
     * Calcule le compteur maximum utilisé dans les réponses existantes.
     */
    private int calculateMaxCounterFromResponses(Long formulaireId) {
        List<ReponseFormulaire> responses = reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId);
        int max = 0;

        for (ReponseFormulaire response : responses) {
            int value = extractCounterValue(response.getPatientIdentifier());
            if (value > max) {
                max = value;
            }
        }

        return max;
    }

    /**
     * Extrait la valeur numérique du compteur depuis l'identifiant patient.
     */
    private int extractCounterValue(String patientIdentifier) {
        if (patientIdentifier == null) {
            return 0;
        }

        Matcher matcher = COUNTER_PATTERN.matcher(patientIdentifier);
        if (!matcher.find()) {
            return 0;
        }

        try {
            return Integer.parseInt(matcher.group(1));
        } catch (NumberFormatException e) {
            // Format numérique invalide, retourner 0
            return 0;
        }
    }

    /**
     * Crée un nouveau compteur pour le formulaire.
     */
    private void createCounter(Long formulaireId, int initialValue) {
        PatientIdentifierCounter counter = new PatientIdentifierCounter();
        counter.setFormulaireId(formulaireId);
        counter.setCounter(initialValue);
        counterRepository.save(counter);
    }
}
