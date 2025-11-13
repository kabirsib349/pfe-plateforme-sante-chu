package com.pfe.backend.controller;

import com.pfe.backend.dto.ChangePasswordDto;
import com.pfe.backend.dto.UserDto;
import com.pfe.backend.dto.UserResponse;
import com.pfe.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal){
        String username = principal.getName();
        var user = userService.getUser(username);

        UserResponse response = new UserResponse(user.getNom(), user.getEmail(), user.getRole().getNom());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Principal principal,
            @RequestBody @Validated UserDto dto
    ) {
        System.out.println("Principal : " + principal);
        System.out.println("Nom : " + dto.getNom());
        System.out.println("Email : " + dto.getEmail());

        var updatedUser = userService.updateProfile(principal.getName(), dto);
        System.out.println("User mis à jour : " + updatedUser);

        UserResponse response = new UserResponse(
                updatedUser.getNom(),
                updatedUser.getEmail(),
                updatedUser.getRole() != null ? updatedUser.getRole().getNom() : null
        );
        return ResponseEntity.ok(response);
    }


    @PutMapping("/changer-mot-de-passe")
    public ResponseEntity<?> changePassword(
            Principal principal,
            @RequestBody @Validated ChangePasswordDto dto
    ) {
        // Si l'utilisateur n'est pas authentifié, renvoyer 401 au lieu d'un NPE qui génère 500
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Utilisateur non authentifié"));
        }
        userService.changePassword(principal.getName(), dto);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès !");
    }

    @ExceptionHandler({IllegalStateException.class, UsernameNotFoundException.class})
    public ResponseEntity<Map<String, String>> handleBusinessException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }
}
