package com.crafthub.backend.dto.stats;

/**
 * Вспомогательный DTO для хранения данных о топе продаж товара.
 */
public record TopProductStats(String name, long salesCount) {}