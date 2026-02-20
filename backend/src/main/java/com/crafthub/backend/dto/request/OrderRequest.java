package com.crafthub.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Запрос на создание заказа.
 */
public record OrderRequest(
        @NotBlank(message = "Укажите адрес доставки")
        String shippingAddress,

        @NotEmpty(message = "Корзина не может быть пустой")
        List<OrderItemRequest> items
) {

    public record OrderItemRequest(
            Long productId,
            Integer quantity
    ) {}
}