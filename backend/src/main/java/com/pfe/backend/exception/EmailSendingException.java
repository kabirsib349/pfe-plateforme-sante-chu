package com.pfe.backend.exception;

/**
 * Exception levée lorsque l'envoi d'un email échoue.
 */
public class EmailSendingException extends RuntimeException {
    public EmailSendingException(String message) {
        super(message);
    }

    public EmailSendingException(String message, Throwable cause) {
        super(message, cause);
    }
}
