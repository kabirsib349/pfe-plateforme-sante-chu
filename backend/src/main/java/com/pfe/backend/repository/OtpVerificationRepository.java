package com.pfe.backend.repository;

import com.pfe.backend.model.OtpVerification;
import com.pfe.backend.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Repository pour la gestion des OTP de double authentification.
 */
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    /**
     * Récupère le dernier OTP non validé d'un utilisateur.
     */
    Optional<OtpVerification> findTopByUtilisateurAndValideFalseOrderByExpirationDesc(Utilisateur utilisateur);

    /**
     * Récupère le dernier OTP (validé ou non) d'un utilisateur.
     */
    Optional<OtpVerification> findTopByUtilisateurOrderByCreatedAtDesc(Utilisateur utilisateur);

    /**
     * Supprime tous les OTP associés à un utilisateur.
     */
    @Transactional
    void deleteByUtilisateur(Utilisateur utilisateur);
}
