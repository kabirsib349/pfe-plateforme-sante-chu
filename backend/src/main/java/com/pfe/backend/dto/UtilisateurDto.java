package com.pfe.backend.dto;

import com.pfe.backend.model.Utilisateur;

public class UtilisateurDto {
    public Long id;
    public String nom;
    public String email;
    public String role;

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
