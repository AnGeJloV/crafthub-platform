package com.crafthub.backend.dto.response;

import java.time.LocalDateTime;

/**
 * Одиночное сообщение в чате.
 */
public record MessageResponse(
        Long id,
        String text,
        Long senderId,
        String senderName,
        boolean isMine,
        boolean isRead,
        LocalDateTime createdAt
) {
}