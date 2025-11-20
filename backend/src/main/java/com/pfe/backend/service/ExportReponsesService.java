package com.pfe.backend.service;

import com.pfe.backend.exception.ResourceNotFoundException;
import com.pfe.backend.model.Champ;
import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.FormulaireMedecin;
import com.pfe.backend.model.ReponseFormulaire;
import com.pfe.backend.repository.FormulaireMedecinRepository;
import com.pfe.backend.repository.ReponseFormulaireRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @brief Service permettant d'exporter en CSV les réponses d'un formulaire rempli par un médecin.
 * @date 20/11/2025
 */
@Service
public class ExportReponsesService {

    private final FormulaireMedecinRepository formulaireMedecinRepository;
    private final ReponseFormulaireRepository reponseFormulaireRepository;

    public ExportReponsesService(FormulaireMedecinRepository formulaireMedecinRepository,
                                 ReponseFormulaireRepository reponseFormulaireRepository) {
        this.formulaireMedecinRepository = formulaireMedecinRepository;
        this.reponseFormulaireRepository = reponseFormulaireRepository;
    }

    /**
     * @brief Génère un CSV contenant les réponses d'un formulaire médecin, dans l'ordre des champs du formulaire.
     * @param formulaireMedecinId Identifiant du formulaire médecin (formulaire rempli).
     * @param emailChercheur Email du chercheur demandeur, utilisé pour vérifier l'autorisation.
     * @return ByteArrayResource Fichier CSV prêt à être téléchargé.
     * @date 20/11/2025
     */
    public ByteArrayResource exporterReponsesCsv(Long formulaireMedecinId, String emailChercheur) {
        // 1. Récupérer le FormulaireMedecin
        FormulaireMedecin formulaireMedecin = formulaireMedecinRepository.findById(formulaireMedecinId)
                .orElseThrow(() -> new ResourceNotFoundException("Formulaire médecin non trouvé"));

        // Vérifier que le chercheur courant est bien celui associé
        if (formulaireMedecin.getChercheur() == null ||
                !formulaireMedecin.getChercheur().getEmail().equals(emailChercheur)) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à exporter ce formulaire");
        }

        // Récupérer le formulaire et forcer le chargement des champs
        Formulaire formulaire = formulaireMedecin.getFormulaire();
        List<Champ> champs = formulaire.getChamps(); // ordre d'affichage dans le front

        // Récupérer toutes les réponses associées à ce FormulaireMedecin
        List<ReponseFormulaire> reponses = reponseFormulaireRepository.findByFormulaireMedecinId(formulaireMedecinId);

        // 5. Mettre les réponses dans une map champId -> ReponseFormulaire
        Map<Long, ReponseFormulaire> reponsesParChamp = new HashMap<>();
        for (ReponseFormulaire r : reponses) {
            if (r.getChamp() != null) {
                reponsesParChamp.put(r.getChamp().getIdChamp(), r);
            }
        }

        //  Construction du CSV
        StringBuilder sb = new StringBuilder();

        // En-tête
        sb.append("numero_question;nom_variable;label;type;unite;valeur;date_saisie\n");

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (int i = 0; i < champs.size(); i++) {
            Champ champ = champs.get(i);
            ReponseFormulaire reponse = reponsesParChamp.get(champ.getIdChamp());

            String numeroQuestion = String.valueOf(i + 1);
            String nomVariable = champ.getLabel() != null ? champ.getLabel().toUpperCase().replaceAll("\\s+", "_") : "";
            String label = escapeCsv(champ.getLabel());
            String type = champ.getType() != null ? champ.getType().name() : "";
            String unite = champ.getUnite() != null ? champ.getUnite() : "";

            String valeur = "";
            String dateSaisie = "";

            if (reponse != null) {
                valeur = escapeCsv(reponse.getValeur());
                if (reponse.getDateSaisie() != null) {
                    dateSaisie = dateFormatter.format(reponse.getDateSaisie());
                }
            }

            sb.append(numeroQuestion).append(";")
                    .append(nomVariable).append(";")
                    .append(label).append(";")
                    .append(type).append(";")
                    .append(unite).append(";")
                    .append(valeur).append(";")
                    .append(dateSaisie).append("\n");
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        return new ByteArrayResource(bytes);
    }

    private String escapeCsv(String valeur) {
        if (valeur == null) {
            return "";
        }
        if (valeur.contains(";") || valeur.contains("\"") || valeur.contains("\n")) {
            return "\"" + valeur.replace("\"", "\"\"") + "\"";
        }
        return valeur;
    }
}
