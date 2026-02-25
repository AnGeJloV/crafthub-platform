package com.crafthub.backend.repository;

import com.crafthub.backend.model.Product;
import com.crafthub.backend.model.ProductStatus;
import com.crafthub.backend.dto.stats.TopProductStats; // Импортируем новый рекорд
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllBySellerId(Long sellerId);

    List<Product> findAllByStatus(ProductStatus status);

    /**
     * Запрос для получения самых продаваемых товаров конкретного мастера.
     */
    @Query("SELECT new com.crafthub.backend.dto.stats.TopProductStats(i.product.name, SUM(i.quantity)) " +
            "FROM OrderItem i " +
            "WHERE i.product.seller.id = :sellerId AND i.order.status = 'COMPLETED' " +
            "GROUP BY i.product.id, i.product.name " +
            "ORDER BY SUM(i.quantity) DESC")
    List<TopProductStats> findTopProductsBySeller(@Param("sellerId") Long sellerId, Pageable pageable);
}