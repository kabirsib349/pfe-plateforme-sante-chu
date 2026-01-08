package com.pfe.backend.service;

import com.pfe.backend.dto.ChangePasswordRequest;
import com.pfe.backend.dto.UserUpdateRequest;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;

/**
 * Service de gestion des comptes utilisateurs.
 * Gère la récupération de profils, la mise à jour des informations et le changement de mot de passe.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UtilisateurRepository repository;

    /**
     * Récupère un utilisateur par son email.
     *
     * @param username email de l'utilisateur
     * @return utilisateur trouvé
     * @throws UsernameNotFoundException si aucun utilisateur ne correspond
     */
    public Utilisateur getUser(String username) {
        return repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec l'email: " + username));
    }

    /**
     * Met à jour le profil de l'utilisateur (nom et email).
     *
     * @param username email actuel de l'utilisateur
     * @param dto nouvelles informations
     * @return utilisateur mis à jour
     */
    public Utilisateur updateProfile(String username, UserUpdateRequest dto) {
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

    /**
     * Change le mot de passe de l'utilisateur.
     *
     * @param username email de l'utilisateur
     * @param dto demande contenant le mot de passe actuel et le nouveau
     * @throws IllegalStateException si le mot de passe actuel est incorrect ou si la confirmation échoue
     */
    public void changePassword(String username, ChangePasswordRequest dto) {
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