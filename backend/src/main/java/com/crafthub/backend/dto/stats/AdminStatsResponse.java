package com.crafthub.backend.dto.stats;

import java.math.BigDecimal;
import java.util.List;

/**
 * Статистика для админ-панели
 */
public record AdminStatsResponse(
        BigDecimal totalGmv, // Оборот всей платформы
        long totalUsers, // Всего юзеров
        long totalSales,  // Всего успешных продаж
        long totalProducts, // Всего товаров в базе
        BigDecimal averageCheck, // Средний чек
        List<ChartPoint> platformGrowth, // График оборота по дням
        List<TopSellerStats> topSellers // Топ-5 мастеров
) {
}