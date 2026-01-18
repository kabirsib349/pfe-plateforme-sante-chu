package com.pfe.backend.exception;

/**
 * Exception levée lorsque aucun OTP n'est trouvé pour l'utilisateur.
 */
public class OtpNotFoundException extends RuntimeException {
    public OtpNotFoundException(String message) {
        super(message);
    }
}
