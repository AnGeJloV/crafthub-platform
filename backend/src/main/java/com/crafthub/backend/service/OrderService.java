package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.OrderRequest;
import com.crafthub.backend.dto.response.OrderResponse;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.OrderRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // Получаем текущего покупателя
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Инициализируем заказ
        Order order = Order.builder()
                .buyer(buyer)
                .shippingAddress(request.shippingAddress())
                .status(OrderStatus.PAID)
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        // Обрабатываем товары из запроса
        for (OrderRequest.OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new RuntimeException("Товар не найден: " + itemReq.productId()));

            // Проверяем, есть ли товар в наличии
            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new IllegalStateException("Недостаточно товара на складе: " + product.getName());
            }

            // Уменьшаем количество на складе (Stock Management)
            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());
            productRepository.save(product);

            // Создаем запись для истории заказа
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.quantity())
                    .priceAtPurchase(product.getPrice()) // Фиксируем цену на момент покупки
                    .build();

            orderItems.add(orderItem);

            // Считаем сумму
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        // Сохраняем заказ в БД
        Order savedOrder = orderRepository.save(order);

        // Очищаем корзину пользователя в БД
        Cart cart = cartService.getOrCreateCart();
        cartService.clearCart(cart);

        return mapToResponse(savedOrder);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderResponse.OrderItemResponse(
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPriceAtPurchase()
                )).toList();

        return new OrderResponse(
                order.getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getCreatedAt(),
                itemResponses
        );
    }
}