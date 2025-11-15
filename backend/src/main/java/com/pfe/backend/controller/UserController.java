package com.pfe.backend.controller;

import com.pfe.backend.dto.ChangePasswordRequest;
import com.pfe.backend.dto.UserUpdateRequest;
import com.pfe.backend.dto.UserResponse;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import com.pfe.backend.service.FormulaireMedecinService;
import com.pfe.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UtilisateurRepository utilisateurRepository;
    private final FormulaireMedecinService formulaireMedecinService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal){
        String username = principal.getName();
        Utilisateur user = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        UserResponse response = new UserResponse(user.getId(), user.getNom(), user.getEmail(), user.getRole().getNom());
        return ResponseEntity.ok(response);
    }
    @GetMapping("/medecins")
    public ResponseEntity<List<UserResponse>> getMedecins(){
        List<Utilisateur> medecins = formulaireMedecinService.getMedecins();
        List<UserResponse> response = medecins.stream()
                .map(medecin -> new UserResponse(medecin.getId(), medecin.getNom(), medecin.getEmail(), medecin.getRole().getNom()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Principal principal,
            @RequestBody @Validated UserUpdateRequest dto
    ) {
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


    @PutMapping("/changer-mot-de-passe")
    public ResponseEntity<?> changePassword(
            Principal principal,
            @RequestBody @Validated ChangePasswordRequest dto
    ) {
        // Si l'utilisateur n'est pas authentifié, renvoyer 401 au lieu d'un NPE qui génère 500
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Utilisateur non authentifié"));
        }
        userService.changePassword(principal.getName(), dto);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès !");
    }

}
