package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "champ")
@Getter
@Setter
public class Champ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_champ")
    private Long idChamp;

    @ManyToOne
    @JoinColumn(name = "id_formulaire", nullable = false)
    @JsonBackReference
    private Formulaire formulaire;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "type", length = 30)
    private TypeChamp type;

    @Column(name = "unite", length = 50) // AJOUT DE CETTE LIGNE
    private String unite;                 // AJOUT DE CETTE LIGNE

    @Column(name = "obligatoire", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean obligatoire;

    @Column(name = "valeur_min")
    private Float valeurMin;

    @Column(name = "valeur_max")
    private Float valeurMax;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_liste_valeur", foreignKey = @ForeignKey(name = "fk_liste_valeur"))
    private ListeValeur listeValeur;
}
