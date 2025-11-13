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

import com.pfe.backend.repository.ListeValeurRepository;
import com.pfe.backend.model.Champ;
import com.pfe.backend.model.ListeValeur;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormulaireMedecinService {

    private final FormulaireMedecinRepository formulaireMedecinRepository;
    private final FormulaireRepository formulaireRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteService activiteService;
    private final com.pfe.backend.repository.ReponseFormulaireRepository reponseFormulaireRepository;
    private final ListeValeurRepository listeValeurRepository;

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
    public Formulaire getFormulairePourRemplissage(Long formulaireMedecinId) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire reçu non trouvé avec l'ID: " + formulaireMedecinId));

        Formulaire formulaire = formulaireMedecin.getFormulaire();

        // Hydratation explicite des collections pour éviter les problèmes de Lazy Loading
        List<ListeValeur> listes = formulaire.getChamps().stream()
                .map(Champ::getListeValeur)
                .filter(lv -> lv != null)
                .distinct()
                .collect(Collectors.toList());

        if (!listes.isEmpty()) {
            listeValeurRepository.findWithFetchedOptions(listes);
        }

        return formulaire;
    }
    
    @Transactional(readOnly = true)
    public List<FormulaireMedecin> getFormulairesEnvoyes(String emailChercheur) {
        return formulaireMedecinRepository.findByChercheurEmail(emailChercheur);
    }
    @Transactional(readOnly = true)
    public List<Utilisateur> getMedecins() {
        return formulaireMedecinRepository.findMedecins();
    }

    @Transactional
    public void masquerPourMedecin(Long formulaireMedecinId, String emailMedecin) {
        FormulaireMedecin fm = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        if (!fm.getMedecin().getEmail().equals(emailMedecin)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
        }

        fm.setMasquePourMedecin(true);
        formulaireMedecinRepository.save(fm);

        // Si masqué des deux côtés, supprimer physiquement
        if (fm.isMasquePourChercheur()) {
            supprimerDefinitivement(fm);
        }
    }

    @Transactional
    public void masquerPourChercheur(Long formulaireMedecinId, String emailChercheur) {
        FormulaireMedecin fm = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        if (!fm.getChercheur().getEmail().equals(emailChercheur)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
        }

        fm.setMasquePourChercheur(true);
        formulaireMedecinRepository.save(fm);

        // Si masqué des deux côtés, supprimer physiquement
        if (fm.isMasquePourMedecin()) {
            supprimerDefinitivement(fm);
        }
    }

    private void supprimerDefinitivement(FormulaireMedecin fm) {
        // Supprimer les réponses
        reponseFormulaireRepository.deleteByFormulaireMedecinId(fm.getId());
        // Supprimer l'assignation
        formulaireMedecinRepository.delete(fm);
    }
}
