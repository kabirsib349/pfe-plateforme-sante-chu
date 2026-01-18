package com.pfe.backend.exception;

/**
 * Exception levée lorsque le nombre maximal de tentatives OTP est atteint.
 */
public class OtpTooManyAttemptsException extends RuntimeException {
    public OtpTooManyAttemptsException(String message) {
        super(message);
    }
}
