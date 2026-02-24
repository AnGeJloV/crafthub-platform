package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(
        @NotBlank(message = "Сообщение не может быть пустым") String text,
        Long dialogueId,
        Long productId,
        Long recipientId
) {
}