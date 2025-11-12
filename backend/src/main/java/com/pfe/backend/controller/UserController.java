package com.pfe.backend.controller;

import com.pfe.backend.dto.UserResponse;
import com.pfe.backend.model.Utilisateur;
import com.pfe.backend.repository.UtilisateurRepository;
import com.pfe.backend.service.FormulaireMedecinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UtilisateurRepository utilisateurRepository;
    private final FormulaireMedecinService formulaireMedecinService;

    @GetMapping("/users/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal){
        String username = principal.getName();
        Utilisateur user = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        UserResponse response = new UserResponse(user.getNom(), user.getEmail(), user.getRole().getNom());
        return ResponseEntity.ok(response);
    }
    @GetMapping("/medecins")
    public ResponseEntity<List<UserResponse>> getMedecins(){
        List<Utilisateur> medecins = formulaireMedecinService.getMedecins();
        List<UserResponse> response = medecins.stream()
                .map(medecin -> new UserResponse(medecin.getNom(), medecin.getEmail(), medecin.getRole().getNom()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
