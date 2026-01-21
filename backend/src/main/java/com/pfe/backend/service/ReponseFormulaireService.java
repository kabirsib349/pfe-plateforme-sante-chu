package com.pfe.backend.service;

import com.pfe.backend.dto.ReponseFormulaireRequest;
import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.Champ;
import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.model.StatutFormulaire;
import com.pfe.backend.repository.ChampRepository;
import com.pfe.backend.repository.FormulaireMedecinRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service de gestion des réponses aux formulaires.
 * Gère la sauvegarde sécurisée, le hachage des identifiants patients et l'export des données.
 */
@Service
@RequiredArgsConstructor
public class ReponseFormulaireService {

    private final ReponseFormulaireRepository reponseFormulaireRepository;
    private final FormulaireMedecinRepository formulaireMedecinRepository;
    private final ChampRepository champRepository;
    private final ActiviteService activiteService;
    private final PatientIdentifierCounterService patientIdentifierCounterService;

    // Constants for error messages and activity logging
    private static final String FORMULAIRE_MEDECIN_NOT_FOUND = "Formulaire médecin non trouvé";
    private static final String FORMULAIRE_ENTITY = "Formulaire";
    private static final String FORMULAIRE_PREFIX = "Formulaire '";

    // Méthode utilitaire pour hacher l'identifiant du patient
    private String hashPatientIdentifier(String identifier) {
        if (identifier == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(identifier.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Impossible de trouver l'algorithme de hachage SHA-256", e);
        }
    }

    // Slugify simple du titre d'etude (formulaire.titre)
    private String slugifyTitreEtude(String titre) {
        if (titre == null) {
            return "etude";
        }
        String slug = titre.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+", "")
                .replaceAll("-+$", "");
        return slug.isEmpty() ? "etude" : slug;
    }

    // Genere ou retourne l identifiant patient complet a partir des donnees de la requete
    private String resolveOrGeneratePatientIdentifier(ReponseFormulaireRequest request, FormulaireMedecin formulaireMedecin) {
        // Si le front fournit deja un identifiant complet, on le conserve pour compatibilite
        if (request.getPatientIdentifier() != null && !request.getPatientIdentifier().trim().isEmpty()
                && (request.getPatientNomInitial() == null || request.getPatientNomInitial().isBlank())
                && (request.getPatientPrenomInitial() == null || request.getPatientPrenomInitial().isBlank())) {
            return request.getPatientIdentifier().trim();
        }

        String nomInitial = Optional.ofNullable(request.getPatientNomInitial()).orElse("").trim().toUpperCase();
        String prenomInitial = Optional.ofNullable(request.getPatientPrenomInitial()).orElse("").trim().toUpperCase();

        if (nomInitial.isEmpty() || prenomInitial.isEmpty()) {
            throw new IllegalArgumentException("Les initiales du patient sont obligatoires (nom et prénom)");
        }

        String etudeSlug = slugifyTitreEtude(formulaireMedecin.getFormulaire().getTitre());

        // Utiliser un compteur atomique en base pour éviter les doublons en cas de concurrence
        Long formulaireId = formulaireMedecin.getFormulaire().getIdFormulaire();
        int nextCounter = patientIdentifierCounterService.getNextCounterForFormulaire(formulaireId);

        String counterStr = String.format("%04d", nextCounter);

        return nomInitial + "-" + prenomInitial + "-" + etudeSlug + "-" + counterStr;
    }

    /**
     * Sauvegarde les réponses d'un formulaire pour un patient donné.
     * Vérifie les droits d'accès et l'unicité du patient pour ce formulaire.
     *
     * @param request Données des réponses
     * @param emailMedecin Email de l'utilisateur qui soumet (médecin ou chercheur)
     * @param enBrouillon true pour sauvegarder en brouillon, false pour soumission finale
     * @throws IllegalArgumentException si non autorisé ou patient déjà existant
     */
    @Transactional
    public void sauvegarderReponses(ReponseFormulaireRequest request, String emailMedecin, boolean enBrouillon) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(request.getFormulaireMedecinId())
                .orElseThrow(() -> new ResourceNotFoundException(FORMULAIRE_MEDECIN_NOT_FOUND));

        verifierAutorisation(formulaireMedecin, emailMedecin);

        // Construire ou reutiliser l identifiant patient
        String patientIdentifier = resolveOrGeneratePatientIdentifier(request, formulaireMedecin);
        request.setPatientIdentifier(patientIdentifier);

        String patientIdentifierHash = hashPatientIdentifier(patientIdentifier);
        
        // Supprimer les anciennes réponses avant de sauvegarder
        reponseFormulaireRepository.deleteByFormulaireMedecinIdAndPatientIdentifierHash(
                request.getFormulaireMedecinId(),
                patientIdentifierHash
        );

        // Validation des réponses
        if (!enBrouillon && (request.getReponses() == null || request.getReponses().isEmpty())) {
            throw new IllegalArgumentException("Aucune réponse fournie");
        }
        
        // Cas spécial : brouillon vide
        if (request.getReponses() == null || request.getReponses().isEmpty()) {
            sauvegarderBrouillonVide(formulaireMedecin, emailMedecin, patientIdentifier);
            return;
        }

        // Sauvegarder les réponses
        sauvegarderReponsesPourPatient(request, formulaireMedecin, patientIdentifierHash, enBrouillon);

        // Mettre à jour le statut et enregistrer l'activité
        mettreAJourStatutFormulaire(formulaireMedecin, enBrouillon, emailMedecin, patientIdentifier);
    }

    private void verifierAutorisation(FormulaireMedecin formulaireMedecin, String emailMedecin) {
        boolean estMedecinAssigne = formulaireMedecin.getMedecin() != null && 
                                    formulaireMedecin.getMedecin().getEmail().equals(emailMedecin);
        
        boolean estChercheurCreateur = formulaireMedecin.getFormulaire().getChercheur() != null && 
                                       formulaireMedecin.getFormulaire().getChercheur().getEmail().equals(emailMedecin);

        boolean estChercheurSansMedecin = formulaireMedecin.getMedecin() == null && 
                                          formulaireMedecin.getChercheur() != null && 
                                          formulaireMedecin.getChercheur().getEmail().equals(emailMedecin);

        if (!estMedecinAssigne && !estChercheurCreateur && !estChercheurSansMedecin) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à remplir ou modifier ce formulaire");
        }
    }

    private void sauvegarderBrouillonVide(FormulaireMedecin formulaireMedecin, String emailMedecin, String patientIdentifier) {
        formulaireMedecin.setStatut(StatutFormulaire.BROUILLON);
        formulaireMedecin.setComplete(false);
        formulaireMedecin.setDateCompletion(null);
        formulaireMedecinRepository.save(formulaireMedecin);
        
        activiteService.enregistrerActivite(
                emailMedecin,
                "Formulaire sauvegardé en brouillon",
                FORMULAIRE_ENTITY,
                formulaireMedecin.getFormulaire().getIdFormulaire(),
                FORMULAIRE_PREFIX + formulaireMedecin.getFormulaire().getTitre() +
                        "' sauvegardé en brouillon pour le patient: " + patientIdentifier
        );
    }

    private void sauvegarderReponsesPourPatient(ReponseFormulaireRequest request, FormulaireMedecin formulaireMedecin,
                                                 String patientIdentifierHash, boolean enBrouillon) {
        for (Map.Entry<?, ?> rawEntry : request.getReponses().entrySet()) {
            Long champId = convertirChampId(rawEntry.getKey());
            String valeur = rawEntry.getValue() != null ? rawEntry.getValue().toString() : null;

            if (valeur != null && !valeur.trim().isEmpty()) {
                sauvegarderUneReponse(champId, valeur, formulaireMedecin, request.getPatientIdentifier(), 
                                     patientIdentifierHash, enBrouillon);
            }
        }
    }

    private Long convertirChampId(Object rawKey) {
        try {
            return Long.valueOf(rawKey.toString());
        } catch (Exception e) {
            throw new IllegalArgumentException("Identifiant de champ invalide: " + rawKey);
        }
    }

    private void sauvegarderUneReponse(Long champId, String valeur, FormulaireMedecin formulaireMedecin,
                                       String patientIdentifier, String patientIdentifierHash, boolean enBrouillon) {
        Champ champ = champRepository.findById(champId)
                .orElseThrow(() -> new ResourceNotFoundException("Champ non trouvé: " + champId));

        ReponseFormulaire reponse = new ReponseFormulaire();
        reponse.setFormulaireMedecin(formulaireMedecin);
        reponse.setChamp(champ);
        reponse.setValeur(valeur);
        reponse.setPatientIdentifier(patientIdentifier);
        reponse.setPatientIdentifierHash(patientIdentifierHash);
        reponse.setDraft(enBrouillon);

        reponseFormulaireRepository.save(reponse);
    }

    private void mettreAJourStatutFormulaire(FormulaireMedecin formulaireMedecin, boolean enBrouillon,
                                             String emailMedecin, String patientIdentifier) {
        if (enBrouillon) {
            formulaireMedecin.setStatut(StatutFormulaire.BROUILLON);
            formulaireMedecin.setComplete(false);
            formulaireMedecin.setDateCompletion(null);
        } else {
            formulaireMedecin.setStatut(StatutFormulaire.PUBLIE);
            formulaireMedecin.setComplete(true);
            formulaireMedecin.setDateCompletion(LocalDateTime.now());
        }

        if (Boolean.TRUE.equals(formulaireMedecin.getMasquePourChercheur())) {
            formulaireMedecin.setMasquePourChercheur(false);
        }

        formulaireMedecinRepository.save(formulaireMedecin);

        String action = enBrouillon ? "Formulaire sauvegardé en brouillon" : "Formulaire rempli";
        activiteService.enregistrerActivite(
                emailMedecin,
                action,
                FORMULAIRE_ENTITY,
                formulaireMedecin.getFormulaire().getIdFormulaire(),
                FORMULAIRE_PREFIX + formulaireMedecin.getFormulaire().getTitre() +
                        "' " + (enBrouillon ? "sauvegardé en brouillon" : "rempli") + 
                        " pour le patient: " + patientIdentifier
        );
    }

    /**
     * Marque un formulaire médecin comme lu.
     *
     * @param formulaireMedecinId ID de l'assignation
     * @param emailMedecin Email du médecin (vérification de sécurité)
     */
    @Transactional
    public void marquerCommeLu(Long formulaireMedecinId, String emailMedecin) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException(FORMULAIRE_MEDECIN_NOT_FOUND));

        if (!formulaireMedecin.getMedecin().getEmail().equals(emailMedecin)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à accéder à ce formulaire");
        }

        if (!Boolean.TRUE.equals(formulaireMedecin.getLu())) {
            formulaireMedecin.setLu(true);
            formulaireMedecin.setDateLecture(LocalDateTime.now());
            formulaireMedecinRepository.save(formulaireMedecin);
        }
    }

    /**
     * Récupère toutes les réponses d'un formulaire assigné.
     *
     * @param formulaireMedecinId ID de l'assignation
     * @return Liste complète des réponses
     */
    @Transactional(readOnly = true)
    public List<ReponseFormulaire> getReponses(Long formulaireMedecinId) {
        return reponseFormulaireRepository.findAllWithOptions(formulaireMedecinId);
    }

    /**
     * Récupère toutes les réponses pour un formulaire (agrège tous les FormulaireMedecin).
     *
     * @param formulaireId ID du formulaire de base
     * @return Liste complète des réponses de tous les médecins
     */
    @Transactional(readOnly = true)
    public List<ReponseFormulaire> getReponsesByFormulaireId(Long formulaireId) {
        return reponseFormulaireRepository.findAllWithOptionsByFormulaireId(formulaireId);
    }


    /**
     * Récupère les réponses d'un patient spécifique pour un formulaire.
     *
     * @param formulaireMedecinId ID de l'assignation
     * @param patientIdentifier Identifiant du patient (sera haché pour la recherche)
     * @return Liste des réponses du patient
     */
    @Transactional(readOnly = true)
    public List<ReponseFormulaire> getReponsesByPatient(Long formulaireMedecinId, String patientIdentifier) {
        String patientIdentifierHash = hashPatientIdentifier(patientIdentifier);
        return reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifierHash(
                formulaireMedecinId,
                patientIdentifierHash
        );
    }

    /**
     * Récupère tous les brouillons pour un FormulaireMedecin.
     * Retourne une liste de résumés de brouillons (un par patient).
     *
     * @param formulaireMedecinId ID de l'assignation
     * @return Liste des brouillons avec informations patient
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllDraftsForFormulaire(Long formulaireMedecinId) {
        formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException(FORMULAIRE_MEDECIN_NOT_FOUND));
        
        // Récupérer tous les patients distincts ayant des réponses (brouillons uniquement)
        List<String> patientHashes = reponseFormulaireRepository
                .findDistinctDraftPatientHashes(formulaireMedecinId);
        
        List<Map<String, Object>> drafts = new java.util.ArrayList<>();
        
        for (String hash : patientHashes) {
            List<ReponseFormulaire> reponses = reponseFormulaireRepository
                    .findByFormulaireMedecinIdAndPatientIdentifierHash(formulaireMedecinId, hash);
            
            if (!reponses.isEmpty()) {
                ReponseFormulaire firstReponse = reponses.get(0);
                Map<String, Object> draft = new java.util.HashMap<>();
                draft.put("patientIdentifier", firstReponse.getPatientIdentifier());
                draft.put("patientHash", hash);
                draft.put("nombreReponses", reponses.size());
                draft.put("derniereModification", firstReponse.getDateSaisie());
                drafts.add(draft);
            }
        }
        
        return drafts;
    }

    /**
     * Récupère le brouillon d'un patient spécifique pour un FormulaireMedecin.
     *
     * @param formulaireMedecinId ID de l'assignation
     * @param patientIdentifier Identifiant du patient
     * @return Map avec patientIdentifier et liste des réponses, ou null si pas de brouillon
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDraftForPatient(Long formulaireMedecinId, String patientIdentifier) {
        String patientHash = hashPatientIdentifier(patientIdentifier);
        
        List<ReponseFormulaire> reponses = reponseFormulaireRepository
                .findByFormulaireMedecinIdAndPatientIdentifierHashAndDraft(formulaireMedecinId, patientHash, true);
        
        if (reponses.isEmpty()) {
            return java.util.Collections.emptyMap();
        }
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("patientIdentifier", patientIdentifier);
        result.put("reponses", reponses);
        
        return result;
    }

    /**
     * Compte le nombre de brouillons (patients uniques) pour un formulaire.
     *
     * @param formulaireMedecinId ID de l'assignation
     * @return Nombre de brouillons
     */
    @Transactional(readOnly = true)
    public int countDrafts(Long formulaireMedecinId) {
        return reponseFormulaireRepository.findDistinctDraftPatientHashes(formulaireMedecinId).size();
    }


    /**
     * Récupère la liste des identifiants de patients uniques ayant des réponses pour ce formulaire.
     *
     * @param formulaireMedecinId ID de l'assignation
     * @return Liste d'identifiants patients
     */
    @Transactional(readOnly = true)
    public List<String> getPatientIdentifiers(Long formulaireMedecinId) {
        // Récupérer toutes les réponses pour ce formulaire
        List<ReponseFormulaire> reponses = reponseFormulaireRepository.findByFormulaireMedecinId(formulaireMedecinId);
        
        // Extraire les identifiants patients uniques (déchiffrés automatiquement par JPA)
        return reponses.stream()
                .map(ReponseFormulaire::getPatientIdentifier)
                .filter(identifier -> identifier != null && !identifier.isEmpty())
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Supprime toutes les réponses d'un patient donné pour un formulaire.
     * Accessible au médecin assigné OU au chercheur propriétaire du formulaire.
     *
     * @param formulaireMedecinId ID de l'assignation
     * @param patientIdentifier Identifiant du patient
     * @param emailUtilisateur Email de l'utilisateur demandeur (médecin ou chercheur)
     */
    @Transactional
    public void supprimerReponsesPatient(Long formulaireMedecinId, String patientIdentifier, String emailUtilisateur) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException(FORMULAIRE_MEDECIN_NOT_FOUND));

        // Vérifier que l'utilisateur est soit le médecin assigné, soit le chercheur propriétaire
        boolean estMedecin = formulaireMedecin.getMedecin().getEmail().equals(emailUtilisateur);
        boolean estChercheur = formulaireMedecin.getFormulaire().getChercheur().getEmail().equals(emailUtilisateur);
        
        if (!estMedecin && !estChercheur) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ces réponses");
        }

        String patientIdentifierHash = hashPatientIdentifier(patientIdentifier);
        reponseFormulaireRepository.deleteByFormulaireMedecinIdAndPatientIdentifierHash(
                formulaireMedecinId,
                patientIdentifierHash
        );
    }

    /**
     * Supprime toutes les réponses d'un FormulaireMedecin.
     * Accessible aux médecins (pour leurs formulaires) et aux chercheurs (pour leurs envois).
     *
     * @param formulaireMedecinId ID de l'assignation
     * @param emailUtilisateur Email de l'utilisateur demandeur (médecin ou chercheur)
     */
    @Transactional
    public void supprimerToutesReponsesFormulaire(Long formulaireMedecinId, String emailUtilisateur) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException(FORMULAIRE_MEDECIN_NOT_FOUND));

        // Vérifier l'autorisation : médecin assigné OU chercheur créateur
        boolean estMedecinAutorise = formulaireMedecin.getMedecin() != null && 
                                      formulaireMedecin.getMedecin().getEmail().equals(emailUtilisateur);
        boolean estChercheurAutorise = formulaireMedecin.getChercheur() != null && 
                                        formulaireMedecin.getFormulaire().getChercheur().getEmail().equals(emailUtilisateur);

        if (!estMedecinAutorise && !estChercheurAutorise) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ces réponses");
        }

        // Supprimer toutes les réponses
        reponseFormulaireRepository.deleteByFormulaireMedecinId(formulaireMedecinId);

        // Réinitialiser le statut du FormulaireMedecin
        formulaireMedecin.setComplete(false);
        formulaireMedecin.setDateCompletion(null);
        formulaireMedecinRepository.save(formulaireMedecin);

        activiteService.enregistrerActivite(
                emailUtilisateur,
                "Suppression de réponses",
                FORMULAIRE_ENTITY,
                formulaireMedecin.getFormulaire().getIdFormulaire(),
                "Toutes les réponses du formulaire '" + formulaireMedecin.getFormulaire().getTitre() + "' ont été supprimées"
        );
    }

    /**
     * Récupère les statistiques d'un formulaire médecin.
     * 
     * @param formulaireMedecinId ID de l'assignation
     * @return DTO avec le nombre de réponses complètes et en cours
     */
    @Transactional(readOnly = true)
    public com.pfe.backend.dto.StatistiqueFormulaireDto getStatistiques(Long formulaireMedecinId) {
        FormulaireMedecin fm = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException(FORMULAIRE_MEDECIN_NOT_FOUND));
        
        // Compter le nombre total de patients distincts
        long nombreTotal = reponseFormulaireRepository.countDistinctPatients(formulaireMedecinId);
        
        // Si le formulaire est complété, toutes les réponses sont soumises
        long nombreCompletes = Boolean.TRUE.equals(fm.getComplete()) ? nombreTotal : 0;
        long nombreEnCours = Boolean.TRUE.equals(fm.getComplete()) ? 0 : nombreTotal;
        
        return new com.pfe.backend.dto.StatistiqueFormulaireDto(nombreCompletes, nombreEnCours);
    }
}

