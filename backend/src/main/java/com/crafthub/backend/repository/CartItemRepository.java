package com.crafthub.backend.repository;

import com.crafthub.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Репозиторий для доступа к элементам корзины
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // Очистить всю корзину после оформления заказа
    @Modifying
    @Transactional
    void deleteAllByCartId(Long cartId);

    // Удалить конкретный товар из корзины юзера
    @Modifying
    @Transactional
    void deleteAllByCartIdAndProductId(Long id, Long productId);
}
