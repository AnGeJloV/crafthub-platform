package com.crafthub.backend.repository;

import com.crafthub.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Получить все отзывы для товара (сортировка от новых к старым)
    List<Review> findAllByProductIdOrderByCreatedAtDesc(Long productId);

    // Проверка: оставлял ли уже пользователь отзыв на этот товар в рамках конкретного заказа?
    boolean existsByOrderIdAndProductId(Long orderId, Long productId);

    // Быстрый расчет среднего рейтинга товара
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId")
    Double calculateAverageRatingForProduct(@Param("productId") Long productId);

    // Быстрый расчет среднего рейтинга продавца (по всем его товарам)
    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.seller.id = :sellerId")
    Double calculateAverageRatingForSeller(@Param("sellerId") Long sellerId);

    // Количество отзывов у продавца
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.seller.id = :sellerId")
    Integer countReviewsForSeller(@Param("sellerId") Long sellerId);

    // Найти все отзывы, на которые пожаловались
    @Query("SELECT r FROM Review r WHERE r.isReported = true ORDER BY r.createdAt DESC")
    List<Review> findAllReported();
}