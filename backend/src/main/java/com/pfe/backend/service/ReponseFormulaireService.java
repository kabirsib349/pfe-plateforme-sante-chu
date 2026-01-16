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
            throw new RuntimeException("Impossible de trouver l'algorithme de hachage SHA-256", e);
        }
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
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        // Vérifier l'autorisation :
        // - si un médecin est assigné, seul ce médecin peut remplir
        // - si aucun médecin n'est assigné (envoi créé par le chercheur), seul le chercheur qui a créé l'envoi peut remplir
        // Vérifier l'autorisation :
        // - le médecin assigné peut remplir
        // - le chercheur créateur du formulaire peut aussi modifier/remplir (pouvoir de correction)
        boolean estMedecinAssigne = formulaireMedecin.getMedecin() != null && 
                                    formulaireMedecin.getMedecin().getEmail().equals(emailMedecin);
        
        boolean estChercheurCreateur = formulaireMedecin.getFormulaire().getChercheur() != null && 
                                       formulaireMedecin.getFormulaire().getChercheur().getEmail().equals(emailMedecin);

        // Cas spécial : si aucun médecin n'est assigné (envoi créé par le chercheur pour lui-même ou test)
        boolean estChercheurSansMedecin = formulaireMedecin.getMedecin() == null && 
                                          formulaireMedecin.getChercheur() != null && 
                                          formulaireMedecin.getChercheur().getEmail().equals(emailMedecin);

        if (!estMedecinAssigne && !estChercheurCreateur && !estChercheurSansMedecin) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à remplir ou modifier ce formulaire");
        }

        String patientIdentifierHash = hashPatientIdentifier(request.getPatientIdentifier());
        
        // Vérifier l'unicité du patient seulement lors de la soumission finale
        // NOTE: On autorise la mise à jour (overwrite), donc on ne bloque plus si le patient existe déjà.
        // La méthode supprime les anciennes réponses juste après.
        /*
        if (!enBrouillon) {
            List<ReponseFormulaire> reponsesFinalesExistantes = reponseFormulaireRepository
                    .findByFormulaireMedecinIdAndPatientIdentifierHashAndDraft(
                            request.getFormulaireMedecinId(),
                            patientIdentifierHash,
                            false
                    );

            if (!reponsesFinalesExistantes.isEmpty()) {
                throw new IllegalArgumentException(
                        "Le patient '" + request.getPatientIdentifier() +
                                "' a déjà été enregistré pour ce formulaire. Utilisez un identifiant différent."
                );
            }
        }
        */

        // Supprimer les anciennes réponses (Brouillon ou anciennes) avant de sauvegarder
        reponseFormulaireRepository.deleteByFormulaireMedecinIdAndPatientIdentifierHash(
                request.getFormulaireMedecinId(),
                patientIdentifierHash
        );

        // Sauvegarder les nouvelles réponses avec l'identifiant patient
        // En mode brouillon, on permet de sauvegarder même sans réponses (juste pour marquer le formulaire comme commencé)
        if (!enBrouillon && (request.getReponses() == null || request.getReponses().isEmpty())) {
            throw new IllegalArgumentException("Aucune réponse fournie");
        }
        
        // Si pas de réponses en mode brouillon, on met juste à jour le statut
        if (request.getReponses() == null || request.getReponses().isEmpty()) {
            // Mettre à jour le statut du formulaire
            formulaireMedecin.setStatut(StatutFormulaire.BROUILLON);
            formulaireMedecin.setComplete(false);
            formulaireMedecin.setDateCompletion(null);
            formulaireMedecinRepository.save(formulaireMedecin);
            
            activiteService.enregistrerActivite(
                    emailMedecin,
                    "Formulaire sauvegardé en brouillon",
                    "Formulaire",
                    formulaireMedecin.getFormulaire().getIdFormulaire(),
                    "Formulaire '" + formulaireMedecin.getFormulaire().getTitre() +
                            "' sauvegardé en brouillon pour le patient: " + request.getPatientIdentifier()
            );
            return;
        }

        for (Map.Entry<?, ?> rawEntry : request.getReponses().entrySet()) {
            Object rawKey = rawEntry.getKey();
            Object rawVal = rawEntry.getValue();

            // Convertir la clé en Long de façon robuste
            Long champId;
            try {
                champId = Long.valueOf(rawKey.toString());
            } catch (Exception e) {
                throw new IllegalArgumentException("Identifiant de champ invalide: " + rawKey);
            }

            String valeur = rawVal != null ? rawVal.toString() : null;

            if (valeur != null && !valeur.trim().isEmpty()) {
                Champ champ = champRepository.findById(champId)
                        .orElseThrow(() -> new ResourceNotFoundException("Champ non trouvé: " + champId));

                ReponseFormulaire reponse = new ReponseFormulaire();
                reponse.setFormulaireMedecin(formulaireMedecin);
                reponse.setChamp(champ);
                reponse.setValeur(valeur);
                reponse.setPatientIdentifier(request.getPatientIdentifier());
                reponse.setPatientIdentifierHash(patientIdentifierHash);
                reponse.setDraft(enBrouillon);

                reponseFormulaireRepository.save(reponse);
            }
        }

        // Mettre à jour le statut selon le mode
        if (enBrouillon) {
            formulaireMedecin.setStatut(StatutFormulaire.BROUILLON);
            formulaireMedecin.setComplete(false);
            formulaireMedecin.setDateCompletion(null);
        } else {
            formulaireMedecin.setStatut(StatutFormulaire.PUBLIE);
            formulaireMedecin.setComplete(true);
            formulaireMedecin.setDateCompletion(LocalDateTime.now());
        }

        // Démasquer pour le chercheur si c'était masqué (pour qu'il voie les nouvelles réponses)
        if (formulaireMedecin.getMasquePourChercheur()) {
            formulaireMedecin.setMasquePourChercheur(false);
        }

        formulaireMedecinRepository.save(formulaireMedecin);

        String action = enBrouillon ? "Formulaire sauvegardé en brouillon" : "Formulaire rempli";
        activiteService.enregistrerActivite(
                emailMedecin,
                action,
                "Formulaire",
                formulaireMedecin.getFormulaire().getIdFormulaire(),
                "Formulaire '" + formulaireMedecin.getFormulaire().getTitre() +
                        "' " + (enBrouillon ? "sauvegardé en brouillon" : "rempli") + 
                        " pour le patient: " + request.getPatientIdentifier()
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
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        if (!formulaireMedecin.getMedecin().getEmail().equals(emailMedecin)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à accéder à ce formulaire");
        }

        if (!formulaireMedecin.getLu()) {
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
        FormulaireMedecin fm = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));
        
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
            return null;
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
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

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
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        // Vérifier l'autorisation : médecin assigné OU chercheur créateur
        boolean estMedecinAutorise = formulaireMedecin.getMedecin() != null && 
                                      formulaireMedecin.getMedecin().getEmail().equals(emailUtilisateur);
        boolean estChercheurAutorise = formulaireMedecin.getChercheur() != null && 
                                        formulaireMedecin.getChercheur().getEmail().equals(emailUtilisateur);

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
                "Formulaire",
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
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));
        
        // Compter le nombre total de patients distincts
        long nombreTotal = reponseFormulaireRepository.countDistinctPatients(formulaireMedecinId);
        
        // Si le formulaire est complété, toutes les réponses sont soumises
        long nombreCompletes = fm.getComplete() ? nombreTotal : 0;
        long nombreEnCours = fm.getComplete() ? 0 : nombreTotal;
        
        return new com.pfe.backend.dto.StatistiqueFormulaireDto(nombreCompletes, nombreEnCours);
    }
}

