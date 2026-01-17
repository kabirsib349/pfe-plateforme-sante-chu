package com.pfe.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/**
 * Entité représentant une demande de réinitialisation de mot de passe.
 * Stocke le code OTP hashé et le token de réinitialisation.
 */
@Entity
@Table(name = "password_reset", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_expires_at", columnList = "expires_at"),
        @Index(name = "idx_reset_token", columnList = "reset_token")
})
@Getter
@Setter
public class PasswordReset {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "attempts", columnDefinition = "INT DEFAULT 0")
    private Integer attempts = 0;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_expires_at")
    private Instant resetExpiresAt;
}
