package com.pfe.backend.service;

import com.pfe.backend.model.PasswordReset;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.PasswordResetRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

/**
 * Service de gestion de la réinitialisation de mot de passe.
 * Implémente un flux en 3 étapes sécurisé.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetRepository passwordResetRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.reset-token.expiry-minutes:15}")
    private int resetTokenExpiryMinutes;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final int OTP_LENGTH = 6;
    private static final int MAX_OTP_ATTEMPTS = 5;

    /**
     * Étape 1 : Demande de réinitialisation du mot de passe.
     * Génère un OTP et l'envoie par email.
     *
     * @param email adresse email de l'utilisateur
     */
    @Transactional
    public void forgotPassword(String email) {
        Optional<Utilisateur> user = utilisateurRepository.findByEmail(email);

        // Réponse neutre : on ne révèle jamais si l'email existe
        if (user.isEmpty()) {
            log.debug("Demande de réinitialisation pour email inexistant : {}", email);
            return;
        }

        // Génération du code de vérification à 6 chiffres
        String verificationCode = generateOTP();
        String verificationCodeHash = BCrypt.hashpw(verificationCode, BCrypt.gensalt());

        // Création ou mise à jour de la demande de réinitialisation
        PasswordReset reset = passwordResetRepository
                .findByUserIdAndUsedAtIsNull(user.get().getId())
                .orElse(new PasswordReset());

        reset.setUserId(user.get().getId());
        reset.setOtpHash(verificationCodeHash);
        reset.setExpiresAt(Instant.now().plus(otpExpiryMinutes, ChronoUnit.MINUTES));
        reset.setAttempts(0);
        reset.setUsedAt(null);
        reset.setResetToken(null);
        reset.setResetExpiresAt(null);

        passwordResetRepository.save(reset);

        // Envoi du code de vérification par email
        mailService.sendVerificationCodeEmail(email, verificationCode, otpExpiryMinutes);

        log.info("Code de vérification envoyé à : {}", email);
    }

    /**
     * Étape 2 : Vérification du code reçu par email.
     *
     * @param email adresse email de l'utilisateur
     * @param code  code à 6 chiffres saisi par l'utilisateur
     * @return token de réinitialisation pour l'étape 3
     */
    @Transactional
    public String verifyResetCode(String email, String code) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Aucun compte utilisateur n'est associé à cette adresse email."
                ));

        PasswordReset reset = passwordResetRepository
                .findByUserIdAndUsedAtIsNull(user.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Aucune demande de réinitialisation en cours n'a été trouvée."
                ));

        // Vérification de l'expiration
        if (Instant.now().isAfter(reset.getExpiresAt())) {
            throw new IllegalArgumentException(
                    "Le code de vérification a expiré. Veuillez recommencer la procédure."
            );
        }

        // Vérification du nombre de tentatives
        if (reset.getAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new IllegalArgumentException(
                    "Le nombre maximum de tentatives a été atteint. Veuillez recommencer la procédure."
            );
        }

        // Vérification du code
        if (!BCrypt.checkpw(code, reset.getOtpHash())) {
            reset.setAttempts(reset.getAttempts() + 1);
            passwordResetRepository.save(reset);
            throw new IllegalArgumentException(
                    "Le code de vérification saisi est incorrect."
            );
        }

        // Code valide : génération d'un token de réinitialisation
        String resetToken = UUID.randomUUID().toString();
        reset.setUsedAt(Instant.now());
        reset.setResetToken(resetToken);
        reset.setResetExpiresAt(
                Instant.now().plus(resetTokenExpiryMinutes, ChronoUnit.MINUTES)
        );

        passwordResetRepository.save(reset);

        log.info("Code vérifié avec succès pour : {}", email);
        return resetToken;
    }

    /**
     * Étape 3 : Enregistrement du nouveau mot de passe.
     *
     * @param resetToken  token obtenu à l'étape 2
     * @param newPassword nouveau mot de passe
     */
    @Transactional
    public void resetPassword(String resetToken, String newPassword) {
        PasswordReset reset = passwordResetRepository.findByResetToken(resetToken)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La demande de réinitialisation est invalide ou a expiré."
                ));

        // Vérification de l'expiration du token
        if (reset.getResetExpiresAt() == null || Instant.now().isAfter(reset.getResetExpiresAt())) {
            throw new IllegalArgumentException(
                    "La demande de réinitialisation a expiré. Veuillez recommencer la procédure."
            );
        }

        Utilisateur user = utilisateurRepository.findById(reset.getUserId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable."
                ));

        // Mise à jour du mot de passe
        user.setMotDePasse(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(user);

        // Invalidation du token
        reset.setResetToken(null);
        reset.setResetExpiresAt(null);
        passwordResetRepository.save(reset);

        log.info("Mot de passe réinitialisé avec succès pour l'utilisateur ID : {}", user.getId());
    }

    /**
     * Génère un code numérique à 6 chiffres.
     */
    private String generateOTP() {
        int otp = secureRandom.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", otp);
    }
}
