package com.pfe.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO pour la validation du code OTP lors de la double authentification.
 */
public record VerifyOtpRequest(
        @Email @NotBlank String email,
        @NotBlank String otpCode
) {}
