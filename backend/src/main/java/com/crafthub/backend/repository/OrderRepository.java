package com.crafthub.backend.repository;

import com.crafthub.backend.model.Order;
import com.crafthub.backend.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // История покупок конкретного юзера
    List<Order> findAllByBuyerId(Long buyerId);

    // Сколько всего заказов сделал покупатель
    long countByBuyerId(Long buyerId);

    // Сколько продаж у мастера (количество чеков, где есть его товары)
    @Query("SELECT COUNT(o) FROM Order o JOIN o.items i WHERE i.product.seller.id = :sellerId")
    long countSalesBySellerId(@Param("sellerId") Long sellerId);

    /**
     * Сложный SQL запрос для графиков аналитики.
     * Группирует продажи мастера по дням за последний месяц.
     */
    @Query(value = "SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') as date, SUM(i.price_at_purchase * i.quantity) as val " +
            "FROM orders o JOIN order_items i ON o.id = i.order_id " +
            "JOIN products p ON p.id = i.product_id " +
            "WHERE p.seller_id = :sellerId AND o.status = 'COMPLETED' " +
            "GROUP BY date ORDER BY date ASC", nativeQuery = true)
    List<Object[]> getDailySalesRaw(@Param("sellerId") Long sellerId);

    // Общая сумма всех завершенных заказов (GMV)
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal calculateTotalGmv();

    // Количество активных споров
    long countByStatus(OrderStatus status);
}