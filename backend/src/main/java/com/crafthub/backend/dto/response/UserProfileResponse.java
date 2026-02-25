package com.crafthub.backend.dto.response;

import java.util.List;

/**
 * Полный ответ профиля (для владельца).
 */
public record UserProfileResponse(
        Long id,
        String email,
        String fullName,
        String phoneNumber,
        String role,
        String avatarUrl,
        String bio,
        Double averageRating,
        Integer reviewsCount,
        java.time.LocalDateTime createdAt,
        long totalOrders,
        boolean enabled,
        List<ProductResponse> products
) {
}