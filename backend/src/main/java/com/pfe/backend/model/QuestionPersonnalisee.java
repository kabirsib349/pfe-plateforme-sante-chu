package com.pfe.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "question_personnalisee")
@Getter
@Setter
@NoArgsConstructor
public class QuestionPersonnalisee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label; // La question

    @Column(nullable = false)
    private String type; // texte, nombre, choix_unique...

    @Column(name = "nom_variable", nullable = false)
    private String nomVariable;

    @Column(columnDefinition = "TEXT")
    private String options; // Stocké en JSON (ex: [{"libelle":"Oui","valeur":"1"}])

    @Column(name = "theme_nom", nullable = false)
    private String themeNom; // "IDENTITE PATIENT", "ANTECEDENTS"...

    private Integer ordre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chercheur_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Utilisateur chercheur;
}
