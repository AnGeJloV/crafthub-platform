package com.crafthub.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * Данные товара для карточки в каталоге
 */
public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String youtubeVideoId,
        String status,
        String categoryDisplayName,
        Long sellerId,
        String sellerName,
        String sellerEmail,
        Double averageRating,
        Integer reviewsCount,
        List<ImageResponse> images
) {
    public record ImageResponse(
            String imageUrl,
            boolean isMain
    ) {
    }
}