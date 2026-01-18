package com.pfe.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entité pour stocker les codes OTP de l'authentification à deux facteurs.
 */
@Getter
@Setter
@Entity
@Table(name = "otp_verification", indexes = {
        @Index(name = "idx_otp_utilisateur", columnList = "utilisateur_id"),
        @Index(name = "idx_otp_expiration", columnList = "expiration")
})
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    @Column(nullable = false)
    private LocalDateTime expiration;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private int tentatives = 0;

    @Column(nullable = false)
    private boolean valide = false;
}
