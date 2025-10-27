package com.pfe.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "\"Optionvaleur\"")
@Getter
@Setter
public class OptionValeur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_option_valeur")
    private Long idOptionValeur;

    @ManyToOne
    @JoinColumn(name = "id_liste_valeur", nullable = false)
    private ListeValeur listeValeur;

    @Column(name = "valeur")
    private String valeur;

    @Column(name = "libelle")
    private String libelle;
}
