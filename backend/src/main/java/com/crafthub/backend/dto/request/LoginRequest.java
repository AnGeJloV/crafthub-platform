package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO для запроса на аутентификацию пользователя.
 */
public record LoginRequest(
        @NotBlank(message = "Электронная почта не может быть пустой")
        @Email(message = "Некорректный формат электронной почты")
        String email,

        @NotBlank(message = "Пароль не может быть пустым")
        String password
) {
}
