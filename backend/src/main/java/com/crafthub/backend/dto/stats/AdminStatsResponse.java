package com.crafthub.backend.dto.stats;

import java.math.BigDecimal;
import java.util.List;

/**
 * Статистика для админ-панели
 */
public record AdminStatsResponse(
        BigDecimal totalGmv, // Оборот всей платформы
        long totalUsers, // Всего юзеров
        long totalSellers, // Всего мастеров
        long totalProducts, // Всего товаров в базе
        List<ChartPoint> platformGrowth,
        long activeDisputes // Количество открытых споров
) {
}