package com.pfe.backend.exception;

/**
 * Exception levée lorsque l'utilisateur demande un OTP trop rapidement (cooldown).
 */
public class OtpCooldownException extends RuntimeException {
    public OtpCooldownException(String message) {
        super(message);
    }
}
