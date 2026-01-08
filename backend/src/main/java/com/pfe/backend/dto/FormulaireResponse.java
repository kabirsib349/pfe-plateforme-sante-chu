package com.pfe.backend.dto;

import com.pfe.backend.model.Formulaire;
import com.pfe.backend.model.Champ;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class FormulaireResponse {
    private Long idFormulaire;
    private String titre;
    private String description;
    private String statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private EtudeInfo etude;
    private ChercheurInfo chercheur;
    private List<ChampResponse> champs;

    @Getter
    @Setter
    public static class EtudeInfo {
        private String titre;
        // On peut ajouter la description ici si le frontend en a besoin, 
        // mapper avec formulaire.getDescription()
    }

    @Getter
    @Setter
    public static class ChercheurInfo {
        private Long id;
        private String nom;
        private String email;
    }
    
    @Getter
    @Setter
    public static class ChampResponse {
        private Long idChamp;
        private String label;
        private String type;
        private String unite;
        private boolean obligatoire;
        private Float valeurMin;
        private Float valeurMax;
        private String categorie;
        private ListeValeurResponse listeValeur;
    }
    
    @Getter
    @Setter
    public static class ListeValeurResponse {
        private Long idListeValeur;
        private String nom;
        private List<OptionValeurResponse> options;
    }
    
    @Getter
    @Setter
    public static class OptionValeurResponse {
        private String valeur;
        private String libelle;
    }

    public static FormulaireResponse fromEntity(Formulaire formulaire) {
        FormulaireResponse response = new FormulaireResponse();
        response.setIdFormulaire(formulaire.getIdFormulaire());
        response.setTitre(formulaire.getTitre());
        response.setDescription(formulaire.getDescription());
        response.setStatut(formulaire.getStatut() != null ? formulaire.getStatut().name() : null);
        response.setDateCreation(formulaire.getDateCreation());
        response.setDateModification(formulaire.getDateModification());

        // Mapping de "l'étude" (virtuelle)
        EtudeInfo etudeInfo = new EtudeInfo();
        etudeInfo.setTitre(formulaire.getTitre()); // Le titre du formulaire sert de titre d'étude
        response.setEtude(etudeInfo);

        // Mapping du chercheur
        if (formulaire.getChercheur() != null) {
            ChercheurInfo chercheurInfo = new ChercheurInfo();
            chercheurInfo.setId(formulaire.getChercheur().getId());
            chercheurInfo.setNom(formulaire.getChercheur().getNom());
            chercheurInfo.setEmail(formulaire.getChercheur().getEmail());
            response.setChercheur(chercheurInfo);
        }

        // Mapping des champs
        if (formulaire.getChamps() != null) {
            response.setChamps(formulaire.getChamps().stream()
                .map(FormulaireResponse::mapChamp)
                .collect(Collectors.toList()));
        }

        return response;
    }
    
    private static ChampResponse mapChamp(Champ champ) {
        ChampResponse dto = new ChampResponse();
        dto.setIdChamp(champ.getIdChamp());
        dto.setLabel(champ.getLabel());
        dto.setType(champ.getType() != null ? champ.getType().name() : null);
        dto.setUnite(champ.getUnite());
        dto.setObligatoire(champ.isObligatoire());
        dto.setValeurMin(champ.getValeurMin());
        dto.setValeurMax(champ.getValeurMax());
        dto.setCategorie(champ.getCategorie());
        
        if (champ.getListeValeur() != null) {
            ListeValeurResponse lvDto = new ListeValeurResponse();
            lvDto.setIdListeValeur(champ.getListeValeur().getIdListeValeur());
            lvDto.setNom(champ.getListeValeur().getNom());
            
            if (champ.getListeValeur().getOptions() != null) {
                lvDto.setOptions(champ.getListeValeur().getOptions().stream()
                    .map(opt -> {
                        OptionValeurResponse optDto = new OptionValeurResponse();
                        optDto.setValeur(opt.getValeur());
                        optDto.setLibelle(opt.getLibelle());
                        return optDto;
                    })
                    .collect(Collectors.toList()));
            }
            dto.setListeValeur(lvDto);
        }
        
        return dto;
    }
}
