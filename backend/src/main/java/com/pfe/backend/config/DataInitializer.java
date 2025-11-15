package com.pfe.backend.config;

import com.pfe.backend.model.Role;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.RoleRepository;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initialisation des données de base...");

        // Créer les rôles s'ils n'existent pas
        createRoleIfNotExists("medecin");
        createRoleIfNotExists("chercheur");

        // Créer des utilisateurs de test s'ils n'existent pas
        // Mot de passe : Test123456!@ (respecte les critères ANSI)
        createUserIfNotExists("Dr. Étude", "etude@chu.fr", "Test123456!@", "chercheur");
        createUserIfNotExists("Dr. Admin", "admin@chu.fr", "Test123456!@", "medecin");

        log.info("Initialisation des données terminée.");
    }

    private void createRoleIfNotExists(String roleName) {
        if (roleRepository.findByNom(roleName).isEmpty()) {
            Role role = new Role();
            role.setNom(roleName);
            roleRepository.save(role);
            log.info("Rôle créé : {}", roleName);
        } else {
            log.info("Rôle déjà existant : {}", roleName);
        }
    }

    private void createUserIfNotExists(String nom, String email, String password, String roleName) {
        if (utilisateurRepository.findByEmail(email).isEmpty()) {
            Role role = roleRepository.findByNom(roleName)
                    .orElseThrow(() -> new RuntimeException("Rôle non trouvé : " + roleName));

            Utilisateur user = new Utilisateur();
            user.setNom(nom);
            user.setEmail(email);
            user.setMotDePasse(passwordEncoder.encode(password));
            user.setRole(role);
            user.setDateCreation(LocalDateTime.now());

            utilisateurRepository.save(user);
            log.info("Utilisateur créé : {} ({})", nom, email);
        } else {
            log.info("Utilisateur déjà existant : {}", email);
        }
    }
}
