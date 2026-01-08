package com.pfe.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Theme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private String description;

    // Un thème a plusieurs questions.
    // CascadeType.ALL: Si on supprime un thème, toutes ses questions sont supprimées.
    // FetchType.EAGER: Charge les questions en même temps que le thème.
    @OneToMany(mappedBy = "theme", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<QuestionTheme> questions = new ArrayList<>();

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<QuestionTheme> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionTheme> questions) {
        this.questions = questions;
    }
}
