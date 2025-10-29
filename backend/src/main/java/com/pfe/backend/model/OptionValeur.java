package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "optionvaleur")
@Getter
@Setter
public class OptionValeur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_option_valeur")
    private Long idOptionValeur;

    @ManyToOne
    @JoinColumn(name = "id_liste_valeur", nullable = false)
    @JsonBackReference
    private ListeValeur listeValeur;

    @Column(name = "valeur", length = 100)
    private String valeur;

    @Column(name = "libelle", length = 255)
    private String libelle;
}
