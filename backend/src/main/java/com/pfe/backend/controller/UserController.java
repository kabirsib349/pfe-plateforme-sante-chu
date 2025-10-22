package com.pfe.backend.controller;

import com.pfe.backend.dto.UserResponse;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal){
        String username = principal.getName();
        Utilisateur user = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        UserResponse response = new UserResponse(user.getNom(), user.getEmail(), user.getRole().getNom());
        return ResponseEntity.ok(response);
    }
}
