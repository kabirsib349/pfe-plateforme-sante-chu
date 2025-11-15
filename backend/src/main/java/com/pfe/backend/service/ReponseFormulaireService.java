package com.pfe.backend.service;

import com.pfe.backend.dto.ReponseFormulaireRequest;
import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.Champ;
import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.repository.ChampRepository;
import com.pfe.backend.repository.FormulaireMedecinRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReponseFormulaireService {

    private final ReponseFormulaireRepository reponseFormulaireRepository;
    private final FormulaireMedecinRepository formulaireMedecinRepository;
    private final ChampRepository champRepository;
    private final ActiviteService activiteService;

    @Transactional
    public void sauvegarderReponses(ReponseFormulaireRequest request, String emailMedecin) {
        // Récupérer le FormulaireMedecin
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(request.getFormulaireMedecinId())
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        // Vérifier que c'est bien le médecin assigné
        if (!formulaireMedecin.getMedecin().getEmail().equals(emailMedecin)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à remplir ce formulaire");
        }

        // Vérifier si ce patient a déjà été enregistré pour ce formulaire
        List<ReponseFormulaire> reponsesExistantes = reponseFormulaireRepository
                .findByFormulaireMedecinIdAndPatientIdentifier(
                        request.getFormulaireMedecinId(), 
                        request.getPatientIdentifier()
                );

        if (!reponsesExistantes.isEmpty()) {
            throw new IllegalArgumentException(
                    "Le patient '" + request.getPatientIdentifier() + 
                    "' a déjà été enregistré pour ce formulaire. Utilisez un identifiant différent."
            );
        }

        // Sauvegarder les nouvelles réponses avec l'identifiant patient
        for (Map.Entry<Long, String> entry : request.getReponses().entrySet()) {
            Long champId = entry.getKey();
            String valeur = entry.getValue();

            if (valeur != null && !valeur.trim().isEmpty()) {
                Champ champ = champRepository.findById(champId)
                        .orElseThrow(() -> new ResourceNotFoundException("Champ non trouvé: " + champId));

                ReponseFormulaire reponse = new ReponseFormulaire();
                reponse.setFormulaireMedecin(formulaireMedecin);
                reponse.setChamp(champ);
                reponse.setValeur(valeur);
                reponse.setPatientIdentifier(request.getPatientIdentifier());

                reponseFormulaireRepository.save(reponse);
            }
        }

        // Marquer le formulaire comme complété
        formulaireMedecin.setComplete(true);
        formulaireMedecin.setDateCompletion(LocalDateTime.now());
        
        // Démasquer pour le chercheur si c'était masqué (pour qu'il voie les nouvelles réponses)
        if (formulaireMedecin.isMasquePourChercheur()) {
            formulaireMedecin.setMasquePourChercheur(false);
        }
        
        formulaireMedecinRepository.save(formulaireMedecin);

        // Enregistrer l'activité
        activiteService.enregistrerActivite(
                emailMedecin,
                "Formulaire rempli",
                "Formulaire",
                formulaireMedecin.getFormulaire().getIdFormulaire(),
                "Formulaire '" + formulaireMedecin.getFormulaire().getTitre() + 
                "' rempli pour le patient: " + request.getPatientIdentifier()
        );
    }

    @Transactional
    public void marquerCommeLu(Long formulaireMedecinId, String emailMedecin) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        // Vérifier que c'est bien le médecin assigné
        if (!formulaireMedecin.getMedecin().getEmail().equals(emailMedecin)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à accéder à ce formulaire");
        }

        if (!formulaireMedecin.isLu()) {
            formulaireMedecin.setLu(true);
            formulaireMedecin.setDateLecture(LocalDateTime.now());
            formulaireMedecinRepository.save(formulaireMedecin);
        }
    }

    @Transactional(readOnly = true)
    public List<ReponseFormulaire> getReponses(Long formulaireMedecinId) {
        return reponseFormulaireRepository.findByFormulaireMedecinId(formulaireMedecinId);
    }
    
    @Transactional(readOnly = true)
    public List<ReponseFormulaire> getReponsesByPatient(Long formulaireMedecinId, String patientIdentifier) {
        return reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifier(
                formulaireMedecinId, 
                patientIdentifier
        );
    }
    
    @Transactional(readOnly = true)
    public List<String> getPatientIdentifiers(Long formulaireMedecinId) {
        return reponseFormulaireRepository.findDistinctPatientIdentifiersByFormulaireMedecinId(formulaireMedecinId);
    }
    
    @Transactional
    public void supprimerReponsesPatient(Long formulaireMedecinId, String patientIdentifier, String emailMedecin) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        // Vérifier que c'est bien le médecin assigné
        if (!formulaireMedecin.getMedecin().getEmail().equals(emailMedecin)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ces réponses");
        }

        reponseFormulaireRepository.deleteByFormulaireMedecinIdAndPatientIdentifier(
                formulaireMedecinId, 
                patientIdentifier
        );
    }
}
