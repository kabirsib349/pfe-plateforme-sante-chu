package com.pfe.backend.service;

import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.FormulaireMedecinRepository;
import com.pfe.backend.repository.FormulaireRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FormulaireMedecinService {

    private final FormulaireMedecinRepository formulaireMedecinRepository;
    private final FormulaireRepository formulaireRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteService activiteService;

    @Transactional
    public FormulaireMedecin envoyerFormulaire(Long formulaireId, String emailMedecin, String emailChercheur) {
        // Récupérer le formulaire
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé avec l'ID: " + formulaireId));

        // Récupérer le médecin
        Utilisateur medecin = utilisateurRepository.findByEmail(emailMedecin)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec l'email: " + emailMedecin));

        // Récupérer le chercheur
        Utilisateur chercheur = utilisateurRepository.findByEmail(emailChercheur)
                .orElseThrow(() -> new ResourceNotFoundException("Chercheur non trouvé avec l'email: " + emailChercheur));

        // Vérifier si le formulaire a déjà été envoyé à ce médecin
        formulaireMedecinRepository.findByFormulaireIdFormulaireAndMedecinEmail(formulaireId, emailMedecin)
                .ifPresent(fm -> {
                    throw new IllegalArgumentException("Ce formulaire a déjà été envoyé au Dr. " + medecin.getNom() + ". Veuillez sélectionner un autre médecin.");
                });
        // Mettre à jour le statut du formulaire à PUBLIE lors du premier envoi
        if (formulaire.getStatut() == com.pfe.backend.model.StatutFormulaire.BROUILLON) {
            formulaire.setStatut(com.pfe.backend.model.StatutFormulaire.PUBLIE);
            formulaireRepository.save(formulaire);
        }

        // Créer l'assignation
        FormulaireMedecin assignment = new FormulaireMedecin();
        assignment.setFormulaire(formulaire);
        assignment.setMedecin(medecin);
        assignment.setChercheur(chercheur);

        FormulaireMedecin saved = formulaireMedecinRepository.save(assignment);
        // Enregistrer l'activité
        activiteService.enregistrerActivite(emailChercheur, "Envoi formulaire", "Formulaire",
                formulaireId, "Formulaire '" + formulaire.getTitre() + "' envoyé à " + medecin.getNom());
        return saved;
    }
    @Transactional(readOnly = true)
    public List<FormulaireMedecin> getFormulairesRecus(String emailMedecin) {
        List<FormulaireMedecin> formulairesRecus = formulaireMedecinRepository.findByMedecinEmail(emailMedecin);
        
        // Charger les relations supplémentaires (etude et champs)
        formulairesRecus.forEach(fm -> {
            if (fm.getFormulaire() != null) {
                // Force le chargement de l'étude
                if (fm.getFormulaire().getEtude() != null) {
                    fm.getFormulaire().getEtude().getTitre();
                }
                // Force le chargement des champs
                if (fm.getFormulaire().getChamps() != null) {
                    fm.getFormulaire().getChamps().size();
                }
            }
        });
        
        return formulairesRecus;
    }
    @Transactional(readOnly = true)
    public List<FormulaireMedecin> getFormulairesEnvoyes(String emailChercheur) {
        return formulaireMedecinRepository.findByChercheurEmail(emailChercheur);
    }
    @Transactional(readOnly = true)
    public List<Utilisateur> getMedecins() {
        return formulaireMedecinRepository.findMedecins();
    }
}
