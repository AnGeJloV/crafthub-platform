package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * Данные для создания или обновления товара
 */
public record ProductRequest(
        @NotBlank(message = "Название товара не может быть пустым")
        String name,

        String description,

        @NotNull(message = "Цена должна быть указана")
        @DecimalMin(value = "0.0", inclusive = false, message = "Цена должна быть больше нуля")
        BigDecimal price,

        @NotNull(message = "Укажите количество на складе")
        @Min(value = 0, message = "Количество не может быть отрицательным")
        Integer stockQuantity,

        @NotNull(message = "Категория не выбрана")
        Long categoryId,

        String youtubeVideoId,

        int mainImageIndex
) {
}