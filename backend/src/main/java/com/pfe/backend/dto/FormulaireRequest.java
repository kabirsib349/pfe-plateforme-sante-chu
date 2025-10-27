package com.pfe.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FormulaireRequest {
    private String titre;
    private String description;
    private Long idEtude;
    private String statut;
    private List<ChampRequest> champs;
}
