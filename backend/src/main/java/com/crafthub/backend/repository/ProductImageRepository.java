package com.crafthub.backend.repository;

import com.crafthub.backend.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Репозиторий для хранения путей к изображениям товаров.
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}