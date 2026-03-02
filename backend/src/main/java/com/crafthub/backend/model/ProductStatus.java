package com.crafthub.backend.model;

/**
 * Статусы модерации товара.
 */
public enum ProductStatus {
    PENDING, // ожидает проверки
    ACTIVE, // виден в каталоге
    REJECTED, // отклонен админом
    DRAFT // черновик (пока не используется TODO)
}
