package com.pfe.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FormulaireRequest {
    private String titre;
    private String description;
    private String titreEtude;
    private String descriptionEtude;
    private String statut;
    private List<ChampRequest> champs;
}
