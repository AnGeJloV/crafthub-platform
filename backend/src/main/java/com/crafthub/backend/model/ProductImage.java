package com.crafthub.backend.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Сущность изображения товара.
 * Хранит пути к загруженным файлам.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String imageUrl; // относительный путь к файлу на сервере

    @Column(nullable = false)
    private boolean isMain; // превью

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
