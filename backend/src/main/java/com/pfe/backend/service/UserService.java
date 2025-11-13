package com.pfe.backend.service;

import com.pfe.backend.dto.ChangePasswordDto;
import com.pfe.backend.dto.UserDto;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UtilisateurRepository repository;

    public Utilisateur getUser(String username) {
        return repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + username));
    }

    public Utilisateur updateProfile(String username, UserDto dto) {
        Utilisateur user = repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        // Mettre à jour uniquement si les nouvelles valeurs ne sont pas nulles ou vides
        if (dto.getNom() != null && !dto.getNom().isEmpty()) {
            user.setNom(dto.getNom());
        }
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            // Optionnel : vérifier si le nouvel email n'est pas déjà pris
            if (repository.findByEmail(dto.getEmail()).isPresent() && !dto.getEmail().equals(username)) {
                throw new IllegalStateException("Cet e-mail est déjà utilisé.");
            }
            user.setEmail(dto.getEmail());
        }

        return repository.save(user);
    }

    public void changePassword(String username, ChangePasswordDto dto) {
        Utilisateur user = repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getMotDePasse())) {
            throw new IllegalStateException("Le mot de passe actuel est incorrect.");
        }
        if (!dto.getNewPassword().equals(dto.getConfirmationPassword())) {
            throw new IllegalStateException("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
        }

        user.setMotDePasse(passwordEncoder.encode(dto.getNewPassword()));
        repository.save(user);
    }
}