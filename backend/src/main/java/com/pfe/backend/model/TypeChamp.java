package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TypeChamp {
    TEXTE("texte"),
    NOMBRE("nombre"),
    CHOIX_UNIQUE("choix_unique"),
    CHOIX_MULTIPLE("choix_multiple"),
    DATE("date"),
    CALCULE("calcule");

    private final String value;

    TypeChamp(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() { return value; }
}