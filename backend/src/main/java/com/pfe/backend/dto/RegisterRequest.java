package com.pfe.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String nom;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
             message = "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre")
    private String password;
    
    @NotBlank(message = "Le rôle est obligatoire")
    @Pattern(regexp = "chercheur|medecin", message = "Le rôle doit être 'chercheur' ou 'medecin'")
    private String role;
}
