package com.pfe.backend.service;


import com.pfe.backend.dto.LoginRequest;
import com.pfe.backend.dto.LoginResponse;
import com.pfe.backend.dto.VerifyOtpRequest;
import com.pfe.backend.model.Role;
import com.pfe.backend.repository.RoleRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pfe.backend.dto.RegisterRequest;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import org.springframework.security.authentication.AuthenticationManager;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Service dédié à l'authentification et à l'inscription des utilisateurs.
 * Gère la validation des identifiants, la génération des tokens JWT,
 * et l'authentification à deux facteurs (MFA).
 */
@Service
@RequiredArgsConstructor
public class AuthentificationService {

    private final UtilisateurRepository utilisateurRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final OtpService otpService;

    /**
     * Inscrit un nouvel utilisateur dans le système.
     * Vérifie si l'email existe déjà et encode le mot de passe.
     *
     * @param request informations d'inscription
     * @throws IllegalStateException si l'email est déjà utilisé
     */
    @org.springframework.transaction.annotation.Transactional
    public void register(RegisterRequest request) {
        if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalStateException("Un utilisateur avec cet email existe déja.");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getPassword()));

        Role userRole = roleRepository.findByNom(request.getRole() != null? request.getRole() : "chercheur")
                .orElseThrow(() -> new IllegalStateException("Le rôle spécifié n'a pas été trouvé."));
        utilisateur.setRole(userRole);
        utilisateurRepository.save(utilisateur);
    }

    /**
     * Étape 1 du login : Authentifie les identifiants et envoie un OTP.
     * Ne retourne pas de JWT à cette étape, uniquement otpRequired=true.
     *
     * @param request identifiants de connexion
     * @return réponse avec otpRequired=true
     * @throws UsernameNotFoundException si l'utilisateur n'existe pas
     */
    public LoginResponse login(LoginRequest request) {
        // Vérification des identifiants
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        // Génération et envoi de l'OTP
        otpService.generateAndSendOtp(user);

        // Retourne sans JWT - attente de vérification OTP
        return new LoginResponse(null, true);
    }

    /**
     * Étape 2 du login : Vérifie l'OTP et génère le JWT final.
     *
     * @param request email et code OTP
     * @return token JWT si l'OTP est valide
     */
    @org.springframework.transaction.annotation.Transactional
    public LoginResponse verifyOtp(VerifyOtpRequest request) {
        Utilisateur user = utilisateurRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable."));

        // Vérification de l'OTP
        otpService.verifyOtp(user, request.otpCode());

        // Mise à jour de la date de dernière connexion
        user.setDerniereConnexion(LocalDateTime.now());
        utilisateurRepository.save(user);

        // Génération du JWT final
        var userDetails = new User(
                user.getEmail(),
                user.getMotDePasse(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getNom()))
        );

        String jwtToken = jwtService.generateToken(userDetails);

        return new LoginResponse(jwtToken, false);
    }
}

