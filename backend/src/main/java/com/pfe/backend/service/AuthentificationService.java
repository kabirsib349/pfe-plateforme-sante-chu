package com.pfe.backend.service;


import com.pfe.backend.dto.LoginRequest;
import com.pfe.backend.dto.LoginResponse;
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

import java.util.Collections;

/**
 * Service dédié à l'authentification et à l'inscription des utilisateurs.
 * Gère la validation des identifiants et la génération des tokens JWT.
 */
@Service
@RequiredArgsConstructor
public class AuthentificationService {

    private final UtilisateurRepository utilisateurRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

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
     * Authentifie un utilisateur et retourne un token JWT.
     *
     * @param request identifiants de connexion
     * @return token JWT si l'authentification réussit
     * @throws UsernameNotFoundException si l'utilisateur n'existe pas
     */
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        var userDetails = new User(
                user.getEmail(),
                user.getMotDePasse(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getNom()))
        );

        String jwtToken = jwtService.generateToken(userDetails);

        return new LoginResponse(jwtToken);
    }

}
