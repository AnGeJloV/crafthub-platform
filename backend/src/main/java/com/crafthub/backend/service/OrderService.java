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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final NotificationService notificationService;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Order order = Order.builder()
                .buyer(buyer)
                .shippingAddress(request.shippingAddress())
                .status(OrderStatus.PAID)
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new RuntimeException("Товар не найден: " + itemReq.productId()));

            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new IllegalStateException("Недостаточно товара на складе: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.quantity())
                    .priceAtPurchase(product.getPrice())
                    .build();

            orderItems.add(orderItem);

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        Cart cart = cartService.getOrCreateCart();
        cartService.clearCart(cart);

        return mapToResponse(savedOrder);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderResponse.OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPriceAtPurchase()
                )).toList();

        return new OrderResponse(
                order.getId(),
                order.getBuyer().getId(),
                order.getBuyer().getFullName(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getCreatedAt(),
                itemResponses
        );
    }

    public List<OrderResponse> getMyPurchases() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User buyer = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findAllByBuyerId(buyer.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getMySales() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email).orElseThrow();

        return orderRepository.findAll().stream()
                .filter(order -> order.getItems().stream()
                        .anyMatch(item -> item.getProduct().getSeller().getId().equals(seller.getId())))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Заказ не найден"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        if (newStatus == OrderStatus.SHIPPED) {
            boolean isSeller = order.getItems().stream()
                    .anyMatch(item -> item.getProduct().getSeller().getId().equals(currentUser.getId()));
            if (!isSeller) throw new RuntimeException("Только продавец может отметить отправку");

            order.setStatus(OrderStatus.SHIPPED);
            notificationService.createNotification(order.getBuyer(),
                    "Ваш заказ #" + order.getId() + " был отправлен!", NotificationType.ORDER);
        }

        if (newStatus == OrderStatus.DELIVERED) {
            if (!order.getBuyer().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Только покупатель может подтвердить получение");
            }
            order.setStatus(OrderStatus.COMPLETED);

            order.getItems().stream()
                    .map(item -> item.getProduct().getSeller())
                    .distinct()
                    .forEach(seller -> notificationService.createNotification(seller,
                            "Покупатель подтвердил получение заказа #" + order.getId() + ". Деньги зачислены!", NotificationType.ORDER));
        }

        orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Заказ не найден"));

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Нельзя отменить завершенный или уже отмененный заказ");
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        orderRepository.save(order);

        notificationService.createNotification(
                order.getBuyer(),
                "Заказ #" + order.getId() + " был отменен. Причина: " + reason,
                NotificationType.ORDER
        );
    }

    @Transactional
    public void openDispute(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Заказ не найден"));

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Спор можно открыть только после отправки товара");
        }

        order.setStatus(OrderStatus.DISPUTED);
        orderRepository.save(order);

        order.getItems().stream()
                .map(item -> item.getProduct().getSeller())
                .distinct()
                .forEach(seller -> notificationService.createNotification(
                        seller,
                        "Покупатель открыл спор по заказу #" + order.getId() + ". Свяжитесь с клиентом.",
                        NotificationType.ORDER
                ));
    }
}