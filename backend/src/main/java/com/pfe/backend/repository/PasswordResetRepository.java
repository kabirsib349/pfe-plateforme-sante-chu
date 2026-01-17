package com.pfe.backend.repository;

import com.pfe.backend.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

/**
 * Repository pour les demandes de réinitialisation de mot de passe.
 */
@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, String> {
    
    /**
     * Trouve une demande de réinitialisation non utilisée pour un utilisateur.
     */
    Optional<PasswordReset> findByUserIdAndUsedAtIsNull(Long userId);

    /**
     * Trouve une demande par son token de réinitialisation.
     */
    Optional<PasswordReset> findByResetToken(String resetToken);

    /**
     * Supprime les demandes expirées.
     */
    @Modifying
    @Query("DELETE FROM PasswordReset p WHERE p.expiresAt < :now")
    void deleteExpired(@Param("now") Instant now);
}
