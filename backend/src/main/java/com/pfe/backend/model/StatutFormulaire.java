package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum StatutFormulaire {
    BROUILLON("brouillon"),
    PUBLIE("publié"),
    ARCHIVE("archivé");

    private final String value;

    StatutFormulaire(String value) { this.value = value; }

    @JsonValue public String getValue() { return value; }
}