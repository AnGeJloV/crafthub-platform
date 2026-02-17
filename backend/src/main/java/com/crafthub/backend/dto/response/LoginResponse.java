package com.crafthub.backend.dto.response;

import com.crafthub.backend.model.Role;

/**
 * DTO для ответа после успешной аутентификации.
 * Содержит JWT-токен и базовую информацию о пользователе.
 */
public record LoginResponse(
        String token,
        String email,
        String fullName,
        Role role
) {
}
