package com.pfe.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "\"Listevaleur\"")
@Getter
@Setter
public class ListeValeur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_liste_valeur")
    private Long idListeValeur;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "listeValeur", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OptionValeur> options;
}
