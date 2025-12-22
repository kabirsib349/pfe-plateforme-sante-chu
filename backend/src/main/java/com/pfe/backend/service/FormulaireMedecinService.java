package com.pfe.backend.service;

import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.FormulaireMedecinRepository;
import com.pfe.backend.repository.FormulaireRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import com.pfe.backend.repository.ListeValeurRepository;
import com.pfe.backend.model.Champ;
import com.pfe.backend.model.ListeValeur;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormulaireMedecinService {

    private final FormulaireMedecinRepository formulaireMedecinRepository;
    private final FormulaireRepository formulaireRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ActiviteService activiteService;
    private final ReponseFormulaireRepository reponseFormulaireRepository;
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
                    throw new IllegalArgumentException("Ce formulaire a déjà été envoyé au Dr. " + medecin.getNom() + ". Le médecin peut le remplir plusieurs fois pour différents patients.");
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

    @Transactional
    public FormulaireMedecin createEnvoiParChercheur(Long formulaireId, String emailChercheur) {
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire non trouvé avec l'ID: " + formulaireId));

        Utilisateur chercheur = utilisateurRepository.findByEmail(emailChercheur)
                .orElseThrow(() -> new ResourceNotFoundException("Chercheur non trouvé avec l'email: " + emailChercheur));

        // Créer l'assignation sans médecin
        FormulaireMedecin assignment = new FormulaireMedecin();
        assignment.setFormulaire(formulaire);
        assignment.setMedecin(null);
        assignment.setChercheur(chercheur);

        FormulaireMedecin saved = formulaireMedecinRepository.save(assignment);

        // Enregistrer l'activité
        activiteService.enregistrerActivite(emailChercheur, "Création envoi (chercheur)", "Formulaire",
                formulaireId, "Formulaire '" + formulaire.getTitre() + "' préparé pour remplissage par le chercheur");

        return saved;
    }

    @Transactional(readOnly = true)
    public List<FormulaireMedecin> getFormulairesRecus(String emailMedecin) {
        // Plus besoin d'hydratation manuelle grâce au JOIN FETCH dans la requête
        return formulaireMedecinRepository.findByMedecinEmail(emailMedecin);
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
        return utilisateurRepository.findByRoleName("medecin");
    }

    @Transactional
    public void masquerPourMedecin(Long formulaireMedecinId, String emailMedecin) {
        FormulaireMedecin fm = getFormulaireMedecinAvecVerification(formulaireMedecinId);
        verifierAutorisationMedecin(fm, emailMedecin);
        masquer(fm, true);
    }

    @Transactional
    public void masquerPourChercheur(Long formulaireMedecinId, String emailChercheur) {
        FormulaireMedecin fm = getFormulaireMedecinAvecVerification(formulaireMedecinId);
        verifierAutorisationChercheur(fm, emailChercheur);
        masquer(fm, false);
    }

    // Méthodes privées pour réduire la duplication
    private FormulaireMedecin getFormulaireMedecinAvecVerification(Long id) {
        return formulaireMedecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));
    }

    private void verifierAutorisationMedecin(FormulaireMedecin fm, String email) {
        if (!fm.getMedecin().getEmail().equals(email)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
        }
    }

    private void verifierAutorisationChercheur(FormulaireMedecin fm, String email) {
        if (!fm.getChercheur().getEmail().equals(email)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce formulaire");
        }
    }

    private void masquer(FormulaireMedecin fm, boolean pourMedecin) {
        if (pourMedecin) {
            fm.setMasquePourMedecin(true);
        } else {
            fm.setMasquePourChercheur(true);
        }

        formulaireMedecinRepository.save(fm);

        // Supprimer définitivement si masqué des deux côtés
        if (fm.isMasquePourMedecin() && fm.isMasquePourChercheur()) {
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
