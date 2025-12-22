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

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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

    @Transactional
    public void sauvegarderReponses(ReponseFormulaireRequest request, String emailMedecin) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(request.getFormulaireMedecinId())
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

<<<<<<< HEAD
        // Vérifier l'autorisation :
        // - si un médecin est assigné, seul ce médecin peut remplir
        // - si aucun médecin n'est assigné (envoi créé par le chercheur), seul le chercheur qui a créé l'envoi peut remplir
        if (formulaireMedecin.getMedecin() != null) {
            if (!formulaireMedecin.getMedecin().getEmail().equals(emailMedecin)) {
                throw new IllegalArgumentException("Vous n'êtes pas autorisé à remplir ce formulaire");
            }
        } else {
            // Aucun médecin assigné → vérifier que c'est bien le chercheur qui a créé l'envoi
            if (formulaireMedecin.getChercheur() == null || !formulaireMedecin.getChercheur().getEmail().equals(emailMedecin)) {
                throw new IllegalArgumentException("Vous n'êtes pas autorisé à remplir ce formulaire");
            }
=======
        if (!formulaireMedecin.getMedecin().getEmail().equals(emailMedecin)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à remplir ce formulaire");
>>>>>>> origin/dev
        }

        String patientIdentifierHash = hashPatientIdentifier(request.getPatientIdentifier());
        List<ReponseFormulaire> reponsesExistantes = reponseFormulaireRepository
<<<<<<< HEAD
                .findByFormulaireMedecinIdAndPatientIdentifier(
                        request.getFormulaireMedecinId(),
                        request.getPatientIdentifier()
=======
                .findByFormulaireMedecinIdAndPatientIdentifierHash(
                        request.getFormulaireMedecinId(),
                        patientIdentifierHash
>>>>>>> origin/dev
                );

        if (!reponsesExistantes.isEmpty()) {
            throw new IllegalArgumentException(
                    "Le patient '" + request.getPatientIdentifier() +
<<<<<<< HEAD
                            "' a déjà été enregistré pour ce formulaire. Utilisez un identifiant différent."
            );
        }

        // Sauvegarder les nouvelles réponses avec l'identifiant patient
        if (request.getReponses() == null || request.getReponses().isEmpty()) {
            throw new IllegalArgumentException("Aucune réponse fournie");
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
=======
                    "' a déjà été enregistré pour ce formulaire. Utilisez un identifiant différent."
            );
        }

        for (Map.Entry<Long, String> entry : request.getReponses().entrySet()) {
            Long champId = entry.getKey();
            String valeur = entry.getValue();
>>>>>>> origin/dev

            if (valeur != null && !valeur.trim().isEmpty()) {
                Champ champ = champRepository.findById(champId)
                        .orElseThrow(() -> new ResourceNotFoundException("Champ non trouvé: " + champId));

                ReponseFormulaire reponse = new ReponseFormulaire();
                reponse.setFormulaireMedecin(formulaireMedecin);
                reponse.setChamp(champ);
                reponse.setValeur(valeur);
                reponse.setPatientIdentifier(request.getPatientIdentifier());
                reponse.setPatientIdentifierHash(patientIdentifierHash); // Sauvegarde du hash

                reponseFormulaireRepository.save(reponse);
            }
        }

        formulaireMedecin.setComplete(true);
        formulaireMedecin.setDateCompletion(LocalDateTime.now());
<<<<<<< HEAD

        // Démasquer pour le chercheur si c'était masqué (pour qu'il voie les nouvelles réponses)
=======
        
>>>>>>> origin/dev
        if (formulaireMedecin.isMasquePourChercheur()) {
            formulaireMedecin.setMasquePourChercheur(false);
        }

        formulaireMedecinRepository.save(formulaireMedecin);

        activiteService.enregistrerActivite(
                emailMedecin,
                "Formulaire rempli",
                "Formulaire",
                formulaireMedecin.getFormulaire().getIdFormulaire(),
                "Formulaire '" + formulaireMedecin.getFormulaire().getTitre() +
<<<<<<< HEAD
                        "' rempli pour le patient: " + request.getPatientIdentifier()
=======
                "' rempli pour le patient: " + request.getPatientIdentifier()
>>>>>>> origin/dev
        );
    }

    @Transactional
    public void marquerCommeLu(Long formulaireMedecinId, String emailMedecin) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

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
        return reponseFormulaireRepository.findAllWithOptions(formulaireMedecinId);
    }

    @Transactional(readOnly = true)
    public List<ReponseFormulaire> getReponsesByPatient(Long formulaireMedecinId, String patientIdentifier) {
<<<<<<< HEAD
        return reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifier(
                formulaireMedecinId,
                patientIdentifier
        );
    }

=======
        String patientIdentifierHash = hashPatientIdentifier(patientIdentifier);
        return reponseFormulaireRepository.findByFormulaireMedecinIdAndPatientIdentifierHash(
                formulaireMedecinId,
                patientIdentifierHash
        );
    }
    
    /**
     * Récupère les identifiants patients uniques pour un formulaire
     * Utilise le hash pour identifier les patients uniques, puis déchiffre les identifiants
     */
>>>>>>> origin/dev
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

    @Transactional
    public void supprimerReponsesPatient(Long formulaireMedecinId, String patientIdentifier, String emailMedecin) {
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        if (!formulaireMedecin.getMedecin().getEmail().equals(emailMedecin)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ces réponses");
        }
<<<<<<< HEAD

        reponseFormulaireRepository.deleteByFormulaireMedecinIdAndPatientIdentifier(
                formulaireMedecinId,
                patientIdentifier
=======
        
        String patientIdentifierHash = hashPatientIdentifier(patientIdentifier);
        reponseFormulaireRepository.deleteByFormulaireMedecinIdAndPatientIdentifierHash(
                formulaireMedecinId,
                patientIdentifierHash
>>>>>>> origin/dev
        );
    }
}

