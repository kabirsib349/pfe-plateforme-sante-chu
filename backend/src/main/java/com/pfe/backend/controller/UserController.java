package com.pfe.backend.controller;

import com.pfe.backend.dto.ChangePasswordRequest;
import com.pfe.backend.dto.UserResponse;
import com.pfe.backend.dto.UserUpdateRequest;
import com.pfe.backend.dto.UtilisateurDto;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import com.pfe.backend.service.FormulaireMedecinService;
import com.pfe.backend.service.UserService;
import com.pfe.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;


/**
 * Contrôleur REST pour la gestion des utilisateurs.
 * Permet de récupérer les informations de profil, lister les médecins/chercheurs et mettre à jour les données utilisateur.
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SuppressWarnings("unused")
public class UserController {

    private final UtilisateurRepository utilisateurRepository;
    private final FormulaireMedecinService formulaireMedecinService;
    private final UserService userService;
    private final UtilisateurService utilisateurService;

    /**
     * Récupère le profil de l'utilisateur actuellement connecté.
     *
     * @param principal utilisateur connecté
     * @return informations de l'utilisateur
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal){
        String username = principal.getName();
        Utilisateur user = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        UserResponse response = new UserResponse(user.getId(), user.getNom(), user.getEmail(), user.getRole().getNom());
        return ResponseEntity.ok(response);
    }
    /**
     * Récupère la liste de tous les médecins.
     *
     * @return liste des médecins
     */
    @GetMapping("/medecins")
    public ResponseEntity<List<UserResponse>> getMedecins(){
        List<Utilisateur> medecins = formulaireMedecinService.getMedecins();
        List<UserResponse> response = medecins.stream()
                .map(medecin -> new UserResponse(medecin.getId(), medecin.getNom(), medecin.getEmail(), medecin.getRole().getNom()))
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère la liste de tous les chercheurs.
     *
     * @return liste des chercheurs
     */
    @GetMapping("/chercheurs")
    public ResponseEntity<List<UserResponse>> getChercheurs(){
        List<UtilisateurDto> chercheurs = utilisateurService.getChercheurs();
        List<UserResponse> response = chercheurs.stream()
                .map(c -> new UserResponse(c.getId(), c.getNom(), c.getEmail(), c.getRole()))
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Met à jour le profil de l'utilisateur connecté.
     *
     * @param principal utilisateur connecté
     * @param dto nouvelles informations
     * @return profil mis à jour
     */
    @PutMapping("/profile")
    public ResponseEntity<Object> updateProfile(Principal principal, @RequestBody UserUpdateRequest dto) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Utilisateur non authentifié"));
        }
        
        log.debug("Updating profile for user: {}", principal.getName());
        log.debug("New data - Name: {}, Email: {}", dto.getNom(), dto.getEmail());

        var updatedUser = userService.updateProfile(principal.getName(), dto);
        log.info("Profile updated successfully for user: {}", updatedUser.getEmail());

        UserResponse response = new UserResponse(
                updatedUser.getId(),
                updatedUser.getNom(),
                updatedUser.getEmail(),
                updatedUser.getRole() != null ? updatedUser.getRole().getNom() : null
        );
        return ResponseEntity.ok(response);
    }


    /**
     * Change le mot de passe de l'utilisateur connecté.
     *
     * @param principal utilisateur connecté
     * @param dto demande de changement de mot de passe avec ancien et nouveau mot de passe
     * @return message de succès
     */
    @PutMapping("/changer-mot-de-passe")
    public ResponseEntity<Object> changePassword(Principal principal, @RequestBody ChangePasswordRequest dto) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Utilisateur non authentifié"));
        }
        userService.changePassword(principal.getName(), dto);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès !");
    }
}
