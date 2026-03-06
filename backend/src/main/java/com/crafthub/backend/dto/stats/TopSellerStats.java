package com.crafthub.backend.dto.stats;

import java.math.BigDecimal;

/**
 * Вспомогательный DTO для хранения данных о лучших мастерах платформы.
 */
public record TopSellerStats(
        String sellerName,
        Long totalSales,
        BigDecimal totalRevenue,
        Double averageRating
) {
}