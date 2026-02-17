package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO для запроса на регистрацию нового пользователя.
 * Содержит данные, необходимые для создания учетной записи.
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Электронная почта не может быть пустой")
    @Email(message = "Некорректный формат электронной почты")
    private String email;

    @NotBlank(message = "Пароль не может быть пустым")
    @Size(min = 8, max = 30, message = "Пароль должен содержать от 8 до 30 символов")
    private String password;

    @NotBlank(message = "Полное имя не может быть пустым")
    private String fullName;
}
