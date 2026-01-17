package com.pfe.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTOs pour les endpoints de réinitialisation de mot de passe.
 * Utilise des records Java pour l'immutabilité.
 */
public class PasswordResetDTO {
    
    /**
     * Requête pour demander un code de réinitialisation.
     */
    public record ForgotPasswordRequest(
            @Email @NotBlank String email
    ) {}

    /**
     * Requête pour vérifier le code reçu par email.
     */
    public record VerifyResetCodeRequest(
            @Email @NotBlank String email,
            @NotBlank String code
    ) {}

    /**
     * Réponse contenant le token de réinitialisation.
     */
    public record VerifyResetCodeResponse(
            String resetToken
    ) {}

    /**
     * Requête pour définir le nouveau mot de passe.
     */
    public record ResetPasswordRequest(
            @NotBlank String resetToken,
            @NotBlank String newPassword
    ) {}

    /**
     * Réponse générique avec message.
     */
    public record GenericResponse(
            String message
    ) {}
}
