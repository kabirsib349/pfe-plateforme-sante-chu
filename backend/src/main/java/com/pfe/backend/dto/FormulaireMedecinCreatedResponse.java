package com.pfe.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormulaireMedecinCreatedResponse {
    private Long id;
    private Long formulaireId;
    private String dateEnvoi;
    private Long medecinId; // can be null
}

