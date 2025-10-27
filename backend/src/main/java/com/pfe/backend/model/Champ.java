package com.pfe.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "\"Champ\"")
@Getter
@Setter
public class Champ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_champ")
    private Long idChamp;

    @ManyToOne
    @JoinColumn(name = "id_formulaire", nullable = false)
    private Formulaire formulaire;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "type", length = 30)
    private TypeChamp type;

    @Column(name = "obligatoire")
    private boolean obligatoire;

    @Column(name = "valeur_min")
    private Float valeurMin;

    @Column(name = "valeur_max")
    private Float valeurMax;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "id_liste_valeur")
    private ListeValeur listeValeur;
}
