package com.pfe.backend.service;

import com.pfe.backend.model.PatientIdentifierCounter;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.repository.PatientIdentifierCounterRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PatientIdentifierCounterService {

    private final PatientIdentifierCounterRepository repository;
    private final ReponseFormulaireRepository reponseFormulaireRepository;

    // Pattern pour extraire le compteur final sur 4 chiffres
    private static final Pattern PATIENT_COUNTER_PATTERN = Pattern.compile("-(\\d{4})$");

    /**
     * Retourne le prochain compteur atomique pour le formulaire donné.
     * Utilise un verrou pessimiste pour éviter les doublons en cas de concurrence.
     * Si aucun compteur n'existe encore, on initialise à partir des identifiants déjà présents.
     */
    @Transactional
    public int getNextCounterForFormulaire(Long formulaireId) {
        Optional<PatientIdentifierCounter> opt = repository.findByFormulaireIdForUpdate(formulaireId);
        PatientIdentifierCounter counter;
        if (opt.isPresent()) {
            counter = opt.get();
            counter.setCounter(counter.getCounter() + 1);
            repository.save(counter);
            return counter.getCounter();
        } else {
            // Initialiser à partir des réponses existantes pour éviter les conflits avec des identifiants déjà créés
            int maxExisting = calculateMaxCounterFromResponses(formulaireId);
            int next = maxExisting + 1;
            counter = new PatientIdentifierCounter();
            counter.setFormulaireId(formulaireId);
            counter.setCounter(next);
            repository.save(counter);
            return next;
        }
    }

    private int calculateMaxCounterFromResponses(Long formulaireId) {
        List<ReponseFormulaire> responses = reponseFormulaireRepository.findByFormulaireIdWithChamp(formulaireId);
        int max = 0;
        for (ReponseFormulaire r : responses) {
            String pid = r.getPatientIdentifier();
            if (pid == null) continue;
            Matcher m = PATIENT_COUNTER_PATTERN.matcher(pid);
            if (m.find()) {
                try {
                    int val = Integer.parseInt(m.group(1));
                    if (val > max) max = val;
                } catch (NumberFormatException ignored) {
                    // Format invalide, on ignore cette réponse et continue avec les autres
                }
            }
        }
        return max;
    }
}
