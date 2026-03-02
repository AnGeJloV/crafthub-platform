package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Данные для отправки сообщения в чат
 */
public record SendMessageRequest(
        @NotBlank(message = "Сообщение не может быть пустым") String text,
        Long dialogueId,
        Long productId,
        Long recipientId
) {
}