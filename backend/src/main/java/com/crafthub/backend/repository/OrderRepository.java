package com.crafthub.backend.repository;

import com.crafthub.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByBuyerId(Long buyerId);

    long countByBuyerId(Long buyerId);

    @Query("SELECT COUNT(o) FROM Order o JOIN o.items i WHERE i.product.seller.id = :sellerId")
    long countSalesBySellerId(@Param("sellerId") Long sellerId);
}