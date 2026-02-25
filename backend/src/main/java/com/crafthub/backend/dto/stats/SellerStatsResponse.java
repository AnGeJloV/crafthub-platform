package com.crafthub.backend.dto.stats;

import java.math.BigDecimal;
import java.util.List;

public record SellerStatsResponse(
        BigDecimal totalRevenue,
        long totalSales,
        Double averageRating,
        List<ChartPoint> salesHistory,
        List<TopProductStats> topProducts
) {
}