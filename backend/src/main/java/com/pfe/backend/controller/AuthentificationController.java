package com.pfe.backend.controller;

import com.pfe.backend.dto.LoginRequest;
import com.pfe.backend.dto.LoginResponse;
import com.pfe.backend.dto.PasswordResetDTO;
import com.pfe.backend.dto.RegisterRequest;
import com.pfe.backend.service.AuthentificationService;
import com.pfe.backend.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur REST pour l'authentification et l'enregistrement des utilisateurs.
 * Gère l'inscription, la connexion avec génération de token JWT,
 * et la réinitialisation de mot de passe.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthentificationController {

    private final AuthentificationService authentificationService;
    private final PasswordResetService passwordResetService;

    /**
     * Enregistre un nouvel utilisateur (médecin ou chercheur).
     *
     * @param request données d'inscription (nom, email, mot de passe, rôle)
     * @return message de confirmation
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request){
        try{
            authentificationService.register(request);
            return new ResponseEntity<>("Utilisateur enregistré avec succès.",HttpStatus.CREATED);
        }catch(IllegalStateException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Authentifie un utilisateur et génère un token JWT.
     *
     * @param request identifiants de connexion (email, mot de passe)
     * @return token JWT
     */
    @PostMapping("login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request){
        try{
            LoginResponse response = authentificationService.login(request);
            return ResponseEntity.ok(response);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Étape 1 : Demande de réinitialisation de mot de passe.
     * Envoie un code de vérification par email.
     *
     * @param request contient l'adresse email
     * @return message de confirmation (toujours le même pour éviter l'énumération)
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResetDTO.GenericResponse> forgotPassword(
            @RequestBody PasswordResetDTO.ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request.email());
        return ResponseEntity.ok(new PasswordResetDTO.GenericResponse(
                "Si un compte existe avec cette adresse, un code de vérification a été envoyé."
        ));
    }

    /**
     * Étape 2 : Vérification du code reçu par email.
     *
     * @param request contient l'email et le code de vérification
     * @return token de réinitialisation pour l'étape finale
     */
    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(
            @RequestBody PasswordResetDTO.VerifyResetCodeRequest request) {
        try {
            String resetToken = passwordResetService.verifyResetCode(request.email(), request.code());
            return ResponseEntity.ok(new PasswordResetDTO.VerifyResetCodeResponse(resetToken));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new PasswordResetDTO.GenericResponse(e.getMessage()));
        }
    }

    /**
     * Étape 3 : Définition du nouveau mot de passe.
     *
     * @param request contient le token de réinitialisation et le nouveau mot de passe
     * @return message de confirmation
     */
    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetDTO.GenericResponse> resetPassword(
            @RequestBody PasswordResetDTO.ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.resetToken(), request.newPassword());
            return ResponseEntity.ok(new PasswordResetDTO.GenericResponse(
                    "Votre mot de passe a été réinitialisé avec succès."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new PasswordResetDTO.GenericResponse(e.getMessage()));
        }
    }
}

