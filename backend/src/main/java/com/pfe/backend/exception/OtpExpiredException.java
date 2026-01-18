package com.pfe.backend.exception;

/**
 * Exception levée lorsque le code OTP a expiré.
 */
public class OtpExpiredException extends RuntimeException {
    public OtpExpiredException(String message) {
        super(message);
    }
}
