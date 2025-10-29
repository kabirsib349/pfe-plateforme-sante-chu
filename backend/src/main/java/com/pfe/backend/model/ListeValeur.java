package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "listevaleur")
@Getter
@Setter
public class ListeValeur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_liste_valeur")
    private Long idListeValeur;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "listeValeur", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OptionValeur> options;
}
