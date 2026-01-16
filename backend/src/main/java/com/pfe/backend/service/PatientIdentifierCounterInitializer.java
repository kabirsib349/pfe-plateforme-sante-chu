package com.pfe.backend.service;

import com.pfe.backend.repository.PatientIdentifierCounterRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PatientIdentifierCounterInitializer implements CommandLineRunner {

    private final ReponseFormulaireRepository reponseFormulaireRepository;
    private final PatientIdentifierCounterRepository counterRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Récupérer tous les formulaireIds présents dans les réponses
        List<Long> formulaireIds = reponseFormulaireRepository.findDistinctFormulaireIds();
        for (Long fid : formulaireIds) {
            // Si un compteur existe déjà, on ne fait rien
            if (counterRepository.findByFormulaireId(fid).isPresent()) continue;

            // Sinon, calculer le max déjà présent
            List<com.pfe.backend.model.ReponseFormulaire> responses = reponseFormulaireRepository.findByFormulaireIdWithChamp(fid);
            int max = 0;
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("-(\\d{4})$");
            for (com.pfe.backend.model.ReponseFormulaire r : responses) {
                String pid = r.getPatientIdentifier();
                if (pid == null) continue;
                java.util.regex.Matcher m = pattern.matcher(pid);
                if (m.find()) {
                    try {
                        int val = Integer.parseInt(m.group(1));
                        if (val > max) max = val;
                    } catch (NumberFormatException ignored) {}
                }
            }

            int next = max + 1;
            com.pfe.backend.model.PatientIdentifierCounter counter = new com.pfe.backend.model.PatientIdentifierCounter();
            counter.setFormulaireId(fid);
            counter.setCounter(next);
            counterRepository.save(counter);
        }
    }
}
