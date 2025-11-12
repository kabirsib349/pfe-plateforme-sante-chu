package com.pfe.backend.dto;

import com.pfe.backend.model.FormulaireMedecin;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class FormulaireEnvoyeResponse {
    private Long id;
    private FormulaireInfo formulaire;
    private MedecinInfo medecin;
    private LocalDateTime dateEnvoi;
    private boolean lu;
    private boolean complete;
    private LocalDateTime dateCompletion;

    @Getter
    @Setter
    public static class FormulaireInfo {
        private Long idFormulaire;
        private String titre;
        private EtudeInfo etude;
    }

    @Getter
    @Setter
    public static class EtudeInfo {
        private String titre;
    }

    @Getter
    @Setter
    public static class MedecinInfo {
        private String nom;
        private String email;
    }

    public static FormulaireEnvoyeResponse fromEntity(FormulaireMedecin fm) {
        FormulaireEnvoyeResponse response = new FormulaireEnvoyeResponse();
        response.setId(fm.getId());
        response.setDateEnvoi(fm.getDateEnvoi());
        response.setLu(fm.isLu());
        response.setComplete(fm.isComplete());
        response.setDateCompletion(fm.getDateCompletion());

        // Médecin
        if (fm.getMedecin() != null) {
            MedecinInfo medecin = new MedecinInfo();
            medecin.setNom(fm.getMedecin().getNom());
            medecin.setEmail(fm.getMedecin().getEmail());
            response.setMedecin(medecin);
        }

        // Formulaire
        if (fm.getFormulaire() != null) {
            FormulaireInfo formulaire = new FormulaireInfo();
            formulaire.setIdFormulaire(fm.getFormulaire().getIdFormulaire());
            formulaire.setTitre(fm.getFormulaire().getTitre());

            // Etude
            if (fm.getFormulaire().getEtude() != null) {
                EtudeInfo etude = new EtudeInfo();
                etude.setTitre(fm.getFormulaire().getEtude().getTitre());
                formulaire.setEtude(etude);
            }

            response.setFormulaire(formulaire);
        }

        return response;
    }
}
