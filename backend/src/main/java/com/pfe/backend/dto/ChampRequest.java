package com.pfe.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChampRequest {
    private String label;
    private String type;
    private String unite; // AJOUT DE CETTE LIGNE
    private boolean obligatoire;
    private Float valeurMin;
    private Float valeurMax;
    private String nomListeValeur; // Ex: "Sexe", "Oui/Non"
    private List<OptionValeurRequest> options; // Utilisé si la liste n'existe pas encore
}
