package com.pfe.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_message")
    private Long id;

    @Setter
    @Column(nullable = false, length = 2000)
    private String contenu;

    @Setter
    @Column(nullable = false)
    private LocalDateTime dateEnvoi;

    @Setter
    @ManyToOne
    @JoinColumn(name = "id_expediteur", nullable = false)
    private Utilisateur emetteur;

    @Setter
    @ManyToOne
    @JoinColumn(name = "id_destinataire", nullable = false)
    private Utilisateur destinataire;

    @Setter
    @Column(name = "lu", nullable = false)
    private boolean lu;

    public Message() {}

    public Message(String contenu, LocalDateTime dateEnvoi, Utilisateur emetteur, Utilisateur destinataire) {
        this.contenu = contenu;
        this.dateEnvoi = dateEnvoi;
        this.emetteur = emetteur;
        this.destinataire = destinataire;
    }


}
