package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

// данные для добавления товара в корзину
public record AddToCartRequest(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity
) {
}