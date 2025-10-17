package com.pfe.backend.model;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "formulaire")
public class Formulaire implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_formulaire")
    private int idFormulaire;

    @Column(name = "libelle", nullable = false)
    private String libelle;

    @Column(name = "type_etude", nullable = false)
    private String typeEtude;

    @ManyToOne
    @JoinColumn(name = "id_createur", nullable = false)
    private Utilisateur createurFormulaire;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    // Constructeur par défaut
    public Formulaire() {}

    // Méthode pour modifier le formulaire
    public void modifierFormulaire(String nouveauLibelle, String nouveauTypeEtude) {
        this.libelle = nouveauLibelle;
        this.typeEtude = nouveauTypeEtude;
    }

    // Méthode pour "supprimer" le formulaire (soft delete possible)
    public void supprimerFormulaire() {
        // À implémenter selon la logique métier (ex: flag isDeleted)
    }
}