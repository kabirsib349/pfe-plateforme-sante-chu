package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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

    @Column(name = "unite", length = 50)
    private String unite;

    @Column(name = "obligatoire", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean obligatoire;

    @Column(name = "valeur_min")
    private Float valeurMin;

    @Column(name = "valeur_max")
    private Float valeurMax;

    @Column(name = "date_min")
    private java.time.LocalDate dateMin;

    @Column(name = "date_max")
    private java.time.LocalDate dateMax;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "id_liste_valeur", foreignKey = @ForeignKey(name = "fk_liste_valeur"))
    private ListeValeur listeValeur;

    @Column(name = "categorie", length = 100)
    private String categorie;

}
