package com.crafthub.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Отзыв на товар.
 * Оставляется покупателем только после успешного завершения заказа.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer rating; // оценка 1 - 5

    @Column(length = 1000)
    private String comment; // текст отзыва

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author; // кто написал

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order; // к какому заказу относится

    @Builder.Default
    @Column(name = "is_reported")
    private boolean isReported = false; // поступила ли жалоба на отзыв

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}