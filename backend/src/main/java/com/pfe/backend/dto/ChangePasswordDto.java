package com.pfe.backend.dto;

import lombok.Data;

@Data
public class ChangePasswordDto {
    private String currentPassword;
    private String newPassword;
    private String confirmationPassword;
}