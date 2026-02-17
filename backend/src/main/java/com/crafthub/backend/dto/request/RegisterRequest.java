package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO для запроса на регистрацию нового пользователя.
 * Содержит данные, необходимые для создания учетной записи.
 */
public record RegisterRequest(
        @NotBlank(message = "Электронная почта не может быть пустой")
        @Email(message = "Некорректный формат электронной почты")
        String email,

        @NotBlank(message = "Пароль не может быть пустым")
        @Size(min = 8, max = 30, message = "Пароль должен содержать от 8 до 30 символов")
        String password,

        @NotBlank(message = "Полное имя не может быть пустым")
        String fullName
) {
}