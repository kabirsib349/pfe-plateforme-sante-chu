package com.pfe.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientReponseInfo {
    private String patientIdentifier;
    private LocalDateTime dateSaisie;
    private int nombreReponses;
}
