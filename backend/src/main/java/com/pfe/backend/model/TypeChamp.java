package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TypeChamp {
    TEXTE("texte"),
    NOMBRE("nombre"),
    CHOIX_MULTIPLE("choix_multiple"),
    DATE("date");

    private final String value;

    TypeChamp(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() { return value; }
}