package com.pfe.backend.dto;

import com.pfe.backend.model.FormulaireMedecin;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class FormulaireRecuResponse {
    private Long id;
    private FormulaireInfo formulaire;
    private ChercheurInfo chercheur;
    private LocalDateTime dateEnvoi;
    private String statut;
    private boolean lu;
    private boolean complete;

    @Getter
    @Setter
    public static class FormulaireInfo {
        private Long idFormulaire;
        private String titre;
        private String description;
        private String statut;
        private LocalDateTime dateCreation;
        private EtudeInfo etude;
        private List<ChampInfo> champs;
    }

    @Getter
    @Setter
    public static class EtudeInfo {
        private String titre;
    }

    @Getter
    @Setter
    public static class ChampInfo {
        private Long idChamp;
        private String label;
        private String type;
        private boolean obligatoire;
    }

    @Getter
    @Setter
    public static class ChercheurInfo {
        private String nom;
        private String email;
    }

    public static FormulaireRecuResponse fromEntity(FormulaireMedecin fm) {
        FormulaireRecuResponse response = new FormulaireRecuResponse();
        response.setId(fm.getId());
        response.setDateEnvoi(fm.getDateEnvoi());
        response.setStatut(fm.getStatut() != null ? fm.getStatut().name() : null);
        response.setLu(fm.isLu());
        response.setComplete(fm.isComplete());

        // Chercheur
        if (fm.getChercheur() != null) {
            ChercheurInfo chercheur = new ChercheurInfo();
            chercheur.setNom(fm.getChercheur().getNom());
            chercheur.setEmail(fm.getChercheur().getEmail());
            response.setChercheur(chercheur);
        }

        // Formulaire
        if (fm.getFormulaire() != null) {
            FormulaireInfo formulaire = new FormulaireInfo();
            formulaire.setIdFormulaire(fm.getFormulaire().getIdFormulaire());
            formulaire.setTitre(fm.getFormulaire().getTitre());
            formulaire.setDescription(fm.getFormulaire().getDescription());
            formulaire.setStatut(fm.getFormulaire().getStatut() != null ? fm.getFormulaire().getStatut().name() : null);
            formulaire.setDateCreation(fm.getFormulaire().getDateCreation());

            // Etude (virtuelle)
            EtudeInfo etude = new EtudeInfo();
            // Le titre du formulaire devient le titre de l'étude
            etude.setTitre(fm.getFormulaire().getTitre());
            formulaire.setEtude(etude);

            // Champs
            if (fm.getFormulaire().getChamps() != null) {
                List<ChampInfo> champs = fm.getFormulaire().getChamps().stream()
                    .map(champ -> {
                        ChampInfo champInfo = new ChampInfo();
                        champInfo.setIdChamp(champ.getIdChamp());
                        champInfo.setLabel(champ.getLabel());
                        champInfo.setType(champ.getType() != null ? champ.getType().name() : null);
                        champInfo.setObligatoire(champ.isObligatoire());
                        return champInfo;
                    })
                    .collect(Collectors.toList());
                formulaire.setChamps(champs);
            }

            response.setFormulaire(formulaire);
        }

        return response;
    }
}
