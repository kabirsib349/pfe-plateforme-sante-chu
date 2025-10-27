package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum StatutEtude {
    PLANIFIEE("planifiée"),
    EN_COURS("en_cours"),
    TERMINEE("terminée"),
    ARCHIVEE("archivée");

    private final String value;

    StatutEtude(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() { return value; }
}