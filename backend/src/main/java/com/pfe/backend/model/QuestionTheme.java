package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class QuestionTheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;
    private String type;
    private String nomVariable;
    private boolean obligatoire;

    // Le champ clé de notre logique : false pour les questions par défaut, true pour les questions ajoutées
    private boolean estSupprimable = true;

    // Plusieurs questions peuvent appartenir à un seul thème.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theme_id")
    @JsonIgnore // Pour éviter les boucles infinies lors de la sérialisation en JSON
    private Theme theme;

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getNomVariable() {
        return nomVariable;
    }

    public void setNomVariable(String nomVariable) {
        this.nomVariable = nomVariable;
    }

    public boolean isObligatoire() {
        return obligatoire;
    }

    public void setObligatoire(boolean obligatoire) {
        this.obligatoire = obligatoire;
    }

    public boolean isEstSupprimable() {
        return estSupprimable;
    }

    public void setEstSupprimable(boolean estSupprimable) {
        this.estSupprimable = estSupprimable;
    }

    public Theme getTheme() {
        return theme;
    }

    public void setTheme(Theme theme) {
        this.theme = theme;
    }
}
