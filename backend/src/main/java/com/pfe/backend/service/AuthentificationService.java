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

@Service
@RequiredArgsConstructor
public class AuthentificationService {

    private final UtilisateurRepository utilisateurRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

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
