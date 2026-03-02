package com.crafthub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Сущность заказа.
 * Это "чек" сделки: кто купил, куда везти и сколько заплачено.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Column(nullable = false)
    private BigDecimal totalAmount; // итоговая сумма заказа

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status; // текущий этап заказа

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items; // список товаров

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason; // причина отмены
}