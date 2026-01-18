package com.pfe.backend.exception;

/**
 * Exception levée lorsque le code OTP saisi est invalide.
 */
public class OtpInvalidException extends RuntimeException {
    public OtpInvalidException(String message) {
        super(message);
    }
}
