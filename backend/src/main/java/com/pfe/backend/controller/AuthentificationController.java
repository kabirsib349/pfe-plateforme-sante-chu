package com.pfe.backend.controller;

import com.pfe.backend.dto.LoginRequest;
import com.pfe.backend.dto.LoginResponse;
import com.pfe.backend.dto.RegisterRequest;
import com.pfe.backend.service.AuthentificationService;
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
 * Gère l'inscription et la connexion avec génération de token JWT.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthentificationController {

    private final AuthentificationService authentificationService;

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
}
