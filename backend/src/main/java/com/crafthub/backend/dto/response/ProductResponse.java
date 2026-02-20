package com.crafthub.backend.dto.response;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String imageUrl,
        String categoryDisplayName,
        String sellerName,
        String sellerEmail
) {
}