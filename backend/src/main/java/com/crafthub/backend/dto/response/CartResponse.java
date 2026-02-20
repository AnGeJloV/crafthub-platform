package com.crafthub.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        List<CartItemResponse> items,
        BigDecimal totalAmount
) {
    public record CartItemResponse(
            Long productId,
            String productName,
            BigDecimal price,
            Integer quantity,
            String imageUrl
    ) {}
}