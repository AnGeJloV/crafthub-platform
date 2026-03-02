package com.crafthub.backend.model;

/**
 * Жизненный цикл заказа.
 */
public enum OrderStatus {
    PAID, // оплачен покупателем
    SHIPPED, // отправлен продавцом
    DELIVERED, // доставлен
    COMPLETED, // завершен (пользователь подтвердил получение)
    CANCELLED, // отменен (деньги возвращены)
    DISPUTED // открыт спор
}