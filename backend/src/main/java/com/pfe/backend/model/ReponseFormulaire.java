package com.pfe.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reponse_formulaire")
@Getter
@Setter
public class ReponseFormulaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reponse")
    private Long idReponse;

    @ManyToOne
    @JoinColumn(name = "id_formulaire_medecin")
    @JsonIgnoreProperties({"formulaire", "medecin", "chercheur"})
    private FormulaireMedecin formulaireMedecin;

    @ManyToOne
    @JoinColumn(name = "id_champ")
    @JsonIgnoreProperties({"formulaire", "listeValeur"})
    private Champ champ;

    @Column(name = "valeur", columnDefinition = "TEXT")
    private String valeur;

    @Column(name = "patient_identifier")
    private String patientIdentifier;

    @Column(name = "date_saisie")
    private LocalDateTime dateSaisie;

    @PrePersist
    protected void onCreate() {
        dateSaisie = LocalDateTime.now();
    }
}
