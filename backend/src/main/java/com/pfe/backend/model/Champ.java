package com.pfe.backend.model;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;
import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "champ")
public class Champ implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_champ")
    private int idChamp;

    @Column(name = "nom_variable", nullable = false)
    private String nomVariable;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_donnee", nullable = false)
    private TypeDonnee typeDonnee;

    @Column(name = "unite")
    private String unite;

    // Utilisés uniquement si typeDonnee == ECHELLE
    @Column(name = "min")
    private Double min;

    @Column(name = "max")
    private Double max;

    public Champ() {}
}