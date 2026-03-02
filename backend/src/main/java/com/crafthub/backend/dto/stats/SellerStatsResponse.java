package com.crafthub.backend.dto.stats;

import java.math.BigDecimal;
import java.util.List;

/**
 * Статистика для личного кабинета мастера
 */
public record SellerStatsResponse(
        BigDecimal totalRevenue, // общая выручка
        long totalSales, // кол-во продаж
        Double averageRating, // рейтинг мастера
        List<ChartPoint> salesHistory, // данные для графика
        List<TopProductStats> topProducts // самые популярные товары
) {
}