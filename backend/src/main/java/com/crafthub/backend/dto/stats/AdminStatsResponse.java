package com.crafthub.backend.dto.stats;
import java.math.BigDecimal;
import java.util.List;

public record AdminStatsResponse(
        BigDecimal totalGmv,
        long totalUsers,
        long totalSellers,
        long totalProducts,
        List<ChartPoint> platformGrowth,
        long activeDisputes
) {}