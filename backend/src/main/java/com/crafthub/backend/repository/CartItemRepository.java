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
    @Modifying
    @Transactional
    void deleteAllByCartId(Long cartId);
    @Modifying
    @Transactional
    void deleteAllByCartIdAndProductId(Long id, Long productId);
}
