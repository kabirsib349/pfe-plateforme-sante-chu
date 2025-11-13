package com.pfe.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FormulaireRequest {
    
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 255, message = "Le titre doit contenir entre 3 et 255 caractères")
    private String titre;
    
    @Size(max = 1000, message = "La description ne peut pas dépasser 1000 caractères")
    private String description;
    
    @NotBlank(message = "Le titre de l'étude est obligatoire")
    @Size(min = 3, max = 255, message = "Le titre de l'étude doit contenir entre 3 et 255 caractères")
    private String titreEtude;
    
    @Size(max = 1000, message = "La description de l'étude ne peut pas dépasser 1000 caractères")
    private String descriptionEtude;
    
    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "BROUILLON|PUBLIE", message = "Le statut doit être BROUILLON ou PUBLIE")
    private String statut;
    
    @NotEmpty(message = "Au moins un champ est requis")
    @Valid
    private List<ChampRequest> champs;
}
