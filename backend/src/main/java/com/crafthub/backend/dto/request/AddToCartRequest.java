package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddToCartRequest(
        @NotNull Long productId,
        @NotNull @Min(1) Integer quantity
) {}