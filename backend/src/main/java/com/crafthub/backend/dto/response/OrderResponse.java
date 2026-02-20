package com.crafthub.backend.dto.response;

import com.crafthub.backend.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Полная информация о заказе для отображения пользователю.
 */
public record OrderResponse(
        Long id,
        BigDecimal totalAmount,
        OrderStatus status,
        String shippingAddress,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {

    public record OrderItemResponse(
            String productName,
            Integer quantity,
            BigDecimal priceAtPurchase
    ) {}
}