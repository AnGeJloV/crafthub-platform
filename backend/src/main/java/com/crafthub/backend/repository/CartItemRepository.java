package com.crafthub.backend.repository;

import com.crafthub.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Репозиторий для доступа к элементам корзины
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    void deleteAllByCartId(Long cartId);
}
