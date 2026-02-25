package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Имя не может быть пустым")
        String fullName,

        @NotBlank(message = "Телефон обязателен")
        String phoneNumber,

        @Size(max = 1000, message = "О себе не более 1000 символов")
        String bio
) {
}