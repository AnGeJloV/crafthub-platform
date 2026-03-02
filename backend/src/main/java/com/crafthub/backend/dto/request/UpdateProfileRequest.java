package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// запрос на изменение профиля
public record UpdateProfileRequest(
        @NotBlank(message = "Имя не может быть пустым")
        String fullName,

        @NotBlank(message = "Номер телефона не может быть пустым")
        @Pattern(regexp = "^(\\+375|375|\\+7|8|7)[0-9]{9,11}$", message = "Введите корректный номер (напр. +375291234567 или 80291234567)")
        String phoneNumber,

        @Size(max = 1000, message = "О себе не более 1000 символов")
        String bio
) {
}