package com.pfe.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChampRequest {
    
    private String id;
    private String categorie;
    
    @NotBlank(message = "Le label est obligatoire")
    @Size(min = 2, max = 255, message = "Le label doit contenir entre 2 et 255 caractères")
    private String label;
    
    @NotBlank(message = "Le type est obligatoire")
    @Pattern(regexp = "TEXTE|NOMBRE|DATE|CHOIX_MULTIPLE", 
             message = "Le type doit être TEXTE, NOMBRE, DATE ou CHOIX_MULTIPLE")
    private String type;
    
    @Size(max = 50, message = "L'unité ne peut pas dépasser 50 caractères")
    private String unite;
    
    private boolean obligatoire;
    
    private Float valeurMin;
    
    private Float valeurMax;

    private java.time.LocalDate dateMin;

    private java.time.LocalDate dateMax;
    
    @Size(max = 100, message = "Le nom de la liste ne peut pas dépasser 100 caractères")
    private String nomListeValeur;
    
    @Valid
    private List<OptionValeurRequest> options;
}
