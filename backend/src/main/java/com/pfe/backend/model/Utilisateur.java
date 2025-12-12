package com.pfe.backend.model;

import com.pfe.backend.config.converter.StringCryptoConverter;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.GenerationType;
import java.time.LocalDateTime;

@Entity
@Table(name="utilisateur")
@Getter
@Setter
public class Utilisateur {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id_utilisateur")
    private Long id;

    @Convert(converter = StringCryptoConverter.class)
    @Column(name="nom",nullable=false)
    private String nom;

    // L'email ne doit PAS être chiffré car il est utilisé pour la connexion et les recherches
    @Column(name="email",nullable=false,unique=true)
    private String email;

    @Column(name="mot_de_passe",nullable=false)
    private String motDePasse;

    @Column(name="date_creation",updatable=false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime dateCreation;

    @Column(name="derniere_connexion")
    private LocalDateTime derniereConnexion;

    @ManyToOne
    @JoinColumn(name="id_role")
    private Role role;

    @PrePersist
    protected void onCreate(){
        dateCreation=LocalDateTime.now();
    }

}
