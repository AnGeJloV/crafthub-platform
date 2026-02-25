package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReviewRequest(
        @NotNull(message = "Укажите оценку")
        @Min(value = 1, message = "Оценка не может быть меньше 1")
        @Max(value = 5, message = "Оценка не может быть больше 5")
        Integer rating,

        String comment,

        @NotNull Long productId,
        @NotNull Long orderId
) {}