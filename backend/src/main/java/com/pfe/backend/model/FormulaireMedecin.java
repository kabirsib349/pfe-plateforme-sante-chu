package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "formulaire_medecin")
@Getter
@Setter
public class FormulaireMedecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="id_formulaire")
    @JsonIgnoreProperties({"chercheur"})
    private Formulaire formulaire;

    @ManyToOne
    @JoinColumn(name = "id_medecin")
    @JsonIgnoreProperties({"password", "role"})
    private Utilisateur medecin;

    @ManyToOne
    @JoinColumn(name = "id_chercheur")
    @JsonIgnoreProperties({"password", "role"})
    private Utilisateur chercheur;

    @Column(name="date_envoi")
    private LocalDateTime dateEnvoi;

    @Enumerated(EnumType.STRING)
    @Column(name="statut")
    private StatutFormulaire statut;

    @Column(name="lu", nullable = false)
    private Boolean lu = false;

    @Column(name="date_lecture")
    private LocalDateTime dateLecture;

    @Column(name="complete", nullable = false)
    private Boolean complete = false;

    @Column(name="date_completion")
    private LocalDateTime dateCompletion;

    @Column(name="masque_pour_medecin", nullable = false)
    private Boolean masquePourMedecin = false;

    @Column(name="masque_pour_chercheur", nullable = false)
    private Boolean masquePourChercheur = false;

    @PrePersist
    public void onCreate(){
        dateEnvoi = LocalDateTime.now();
        statut = StatutFormulaire.BROUILLON;  // Changement : BROUILLON au lieu de PUBLIE
        complete = false;  // Initialiser à false
    }


}
