package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
        String fullName,

        @NotBlank(message = "Номер телефона не может быть пустым")
        @Pattern(regexp = "^(\\+375|375|\\+7|8|7)[0-9]{9,11}$", message = "Введите корректный номер (напр. +375291234567 или 80291234567)")
        String phoneNumber
) {
}