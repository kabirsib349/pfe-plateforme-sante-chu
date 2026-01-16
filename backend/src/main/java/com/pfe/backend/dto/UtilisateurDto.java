package com.pfe.backend.dto;

import com.pfe.backend.model.Utilisateur;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UtilisateurDto {
    private Long id;
    private String nom;
    private String email;
    private String role;

    public UtilisateurDto(Long id, String nom, String email, String role) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.role = role;
    }

    public static UtilisateurDto from(Utilisateur u){
        return new UtilisateurDto(
                u.getId(),
                u.getNom(),
                u.getEmail(),
                u.getRole().getNom()
        );
    }
}
