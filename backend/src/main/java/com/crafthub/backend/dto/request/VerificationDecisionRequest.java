package com.crafthub.backend.dto.request;

/**
 * DTO для принятия решения по заявке администратором.
 */
public record VerificationDecisionRequest(
        String reason // Причина отказа (опционально для одобрения)
) {
}