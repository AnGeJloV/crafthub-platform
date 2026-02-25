package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Введите старый пароль")
        String oldPassword,

        @NotBlank(message = "Введите новый пароль")
        @Size(min = 8, message = "Новый пароль должен быть от 8 символов")
        String newPassword
) {}