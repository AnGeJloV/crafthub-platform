package com.crafthub.backend.repository;

import com.crafthub.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Репозиторий для доступа к корзине пользователя
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // Найти корзину конкретного юзера (чтобы добавить туда товар)
    Optional<Cart> findByUserId(Long userId);
}
