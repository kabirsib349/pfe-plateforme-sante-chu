package com.pfe.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String nom;
    private String email;
    private String password;
}
