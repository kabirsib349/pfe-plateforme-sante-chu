package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
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

    @Column(name="lu", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean lu = false;

    @Column(name="date_lecture")
    private LocalDateTime dateLecture;

    @Column(name="complete", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean complete = false;

    @Column(name="date_completion")
    private LocalDateTime dateCompletion;

    @Column(name="masque_pour_medecin", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean masquePourMedecin = false;

    @Column(name="masque_pour_chercheur", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private boolean masquePourChercheur = false;

    @PrePersist
    public void onCreate(){
        dateEnvoi = LocalDateTime.now();
        statut = StatutFormulaire.PUBLIE;
    }

}
