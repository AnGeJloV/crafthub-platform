package com.crafthub.backend.dto.response;

import java.time.LocalDateTime;

/**
 * Информация о диалоге для списка чатов.
 */
public record DialogueResponse(
        Long id,
        Long productId,
        String productName,
        String productImage,
        String interlocutorName,
        String lastMessage,
        LocalDateTime lastMessageTime,
        Long interlocutorId,
        long unreadCount
) {
}