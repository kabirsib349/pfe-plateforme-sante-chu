package com.pfe.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Constants for error response keys
    private static final String TIMESTAMP_KEY = "timestamp";
    private static final String STATUS_KEY = "status";
    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String PATH_KEY = "path";

    // Gère les erreurs de validation des DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, 
            WebRequest request) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        Map<String, Object> body = new HashMap<>();
        body.put(TIMESTAMP_KEY, new Date());
        body.put(STATUS_KEY, HttpStatus.BAD_REQUEST.value());
        body.put(ERROR_KEY, "Validation Failed");
        body.put(MESSAGE_KEY, "Les données fournies sont invalides");
        body.put("errors", errors);
        body.put(PATH_KEY, request.getDescription(false).substring(4));
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Gère les erreurs de ressource non trouvée
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put(TIMESTAMP_KEY, new Date());
        body.put(STATUS_KEY, HttpStatus.NOT_FOUND.value());
        body.put(ERROR_KEY, "Not Found");
        body.put(MESSAGE_KEY, ex.getMessage());
        body.put(PATH_KEY, request.getDescription(false).substring(4));

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    // Gère les erreurs d'arguments invalides (ex: statut, type de champ)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put(TIMESTAMP_KEY, new Date());
        body.put(STATUS_KEY, HttpStatus.BAD_REQUEST.value());
        body.put(ERROR_KEY, "Bad Request");
        body.put(MESSAGE_KEY, ex.getMessage());
        body.put(PATH_KEY, request.getDescription(false).substring(4));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Gère les erreurs UsernameNotFoundException
    @ExceptionHandler(org.springframework.security.core.userdetails.UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUsernameNotFoundException(
            org.springframework.security.core.userdetails.UsernameNotFoundException ex, 
            WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put(TIMESTAMP_KEY, new Date());
        body.put(STATUS_KEY, HttpStatus.NOT_FOUND.value());
        body.put(ERROR_KEY, "Not Found");
        body.put(MESSAGE_KEY, ex.getMessage());
        body.put(PATH_KEY, request.getDescription(false).substring(4));

        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    // Gère les erreurs IllegalStateException
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(
            IllegalStateException ex, 
            WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put(TIMESTAMP_KEY, new Date());
        body.put(STATUS_KEY, HttpStatus.BAD_REQUEST.value());
        body.put(ERROR_KEY, "Bad Request");
        body.put(MESSAGE_KEY, ex.getMessage());
        body.put(PATH_KEY, request.getDescription(false).substring(4));

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Gère toutes les autres erreurs inattendues
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put(TIMESTAMP_KEY, new Date());
        body.put(STATUS_KEY, HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put(ERROR_KEY, "Internal Server Error");
        body.put(MESSAGE_KEY, "Une erreur interne est survenue sur le serveur.");
        body.put(PATH_KEY, request.getDescription(false).substring(4));

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}