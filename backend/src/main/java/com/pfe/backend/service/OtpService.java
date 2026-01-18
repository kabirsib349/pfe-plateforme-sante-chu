package com.pfe.backend.service;

import com.pfe.backend.exception.*;
import com.pfe.backend.model.OtpVerification;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * Service de gestion des OTP pour l'authentification à deux facteurs.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 5;
    private static final int OTP_MAX_ATTEMPTS = 3;
    private static final int OTP_COOLDOWN_SECONDS = 60;

    private final OtpVerificationRepository otpRepository;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Génère et envoie un OTP par email pour l'authentification à deux facteurs.
     *
     * @param utilisateur Utilisateur concerné
     * @return Code OTP généré (pour les tests uniquement, ne pas exposer)
     */
    @Transactional
    public String generateAndSendOtp(Utilisateur utilisateur) {
        // Vérification du cooldown
        otpRepository.findTopByUtilisateurOrderByCreatedAtDesc(utilisateur)
                .ifPresent(lastOtp -> {
                    LocalDateTime nextAllowed = lastOtp.getCreatedAt().plusSeconds(OTP_COOLDOWN_SECONDS);
                    if (LocalDateTime.now().isBefore(nextAllowed)) {
                        long secondsLeft = java.time.Duration.between(LocalDateTime.now(), nextAllowed).getSeconds();
                        throw new OtpCooldownException(
                                "Veuillez attendre " + secondsLeft + " secondes avant de demander un nouveau code."
                        );
                    }
                });

        // Invalidation des anciens OTP
        otpRepository.deleteByUtilisateur(utilisateur);

        // Génération du code OTP
        String otpCode = generateRandomOtp();

        // Création de l'entité OTP
        OtpVerification otp = new OtpVerification();
        otp.setUtilisateur(utilisateur);
        otp.setCodeHash(passwordEncoder.encode(otpCode));
        otp.setExpiration(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
        otp.setTentatives(0);
        otp.setValide(false);
        otp.setCreatedAt(LocalDateTime.now());

        otpRepository.save(otp);

        // Envoi par email
        mailService.sendOtpEmail(utilisateur.getEmail(), otpCode, OTP_VALIDITY_MINUTES);

        log.info("OTP envoyé à : {}", utilisateur.getEmail());

        return otpCode;
    }

    /**
     * Vérifie le code OTP saisi par l'utilisateur.
     *
     * @param utilisateur Utilisateur concerné
     * @param otpSaisi    Code saisi par l'utilisateur
     */
    @Transactional
    public void verifyOtp(Utilisateur utilisateur, String otpSaisi) {
        OtpVerification otp = otpRepository
                .findTopByUtilisateurAndValideFalseOrderByExpirationDesc(utilisateur)
                .orElseThrow(() -> new OtpNotFoundException(
                        "Aucun code de vérification en attente. Veuillez vous reconnecter."
                ));

        // Vérification expiration
        if (otp.getExpiration().isBefore(LocalDateTime.now())) {
            throw new OtpExpiredException("Le code a expiré. Veuillez vous reconnecter.");
        }

        // Vérification nombre de tentatives
        if (otp.getTentatives() >= OTP_MAX_ATTEMPTS) {
            throw new OtpTooManyAttemptsException(
                    "Nombre maximal de tentatives atteint. Veuillez vous reconnecter."
            );
        }

        // Vérification du code
        if (!passwordEncoder.matches(otpSaisi, otp.getCodeHash())) {
            otp.setTentatives(otp.getTentatives() + 1);
            otpRepository.save(otp);
            int remaining = OTP_MAX_ATTEMPTS - otp.getTentatives();
            throw new OtpInvalidException(
                    "Code incorrect. " + remaining + " tentative(s) restante(s)."
            );
        }

        // Code valide - marquer comme utilisé
        otp.setValide(true);
        otpRepository.save(otp);

        log.info("OTP vérifié avec succès pour : {}", utilisateur.getEmail());
    }

    /**
     * Génère un code OTP aléatoire à 6 chiffres.
     */
    private String generateRandomOtp() {
        int number = secureRandom.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", number);
    }
}
