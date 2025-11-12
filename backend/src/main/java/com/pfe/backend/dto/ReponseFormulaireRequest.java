package com.pfe.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class ReponseFormulaireRequest {
    private Long formulaireMedecinId;
    private Map<Long, String> reponses; // Map<idChamp, valeur>
}
