package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.AddToCartRequest;
import com.crafthub.backend.dto.response.CartResponse;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Получает корзину текущего пользователя.
     * Если корзины еще нет — создает её.
     */
    @Transactional
    public Cart getOrCreateCart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).items(new ArrayList<>()).build()));
    }

    @Transactional
    public void addToCart(AddToCartRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Cart cart = getOrCreateCart();
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        if (product.getSeller().getId().equals(user.getId())) {
            throw new IllegalStateException("Вы не можете купить собственный товар");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        int currentInCart = existingItem.map(CartItem::getQuantity).orElse(0);
        int newTotalQuantity = currentInCart + request.quantity();

        if (product.getStockQuantity() < newTotalQuantity) {
            throw new IllegalStateException("Недостаточно товара на складе. Доступно: " + product.getStockQuantity());
        }

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(newTotalQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .build();
            cartItemRepository.save(newItem);
        }
    }

    @Transactional
    public CartResponse getCartResponse() {
        Cart cart = getOrCreateCart();

        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    // Ищем главное фото товара среди списка изображений
                    String mainImageUrl = item.getProduct().getImages().stream()
                            .filter(ProductImage::isMain)
                            .map(ProductImage::getImageUrl)
                            .findFirst()
                            .orElse(item.getProduct().getImages().isEmpty()
                                    ? ""
                                    : item.getProduct().getImages().get(0).getImageUrl());

                    return new CartResponse.CartItemResponse(
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getProduct().getPrice(),
                            item.getQuantity(),
                            mainImageUrl
                    );
                }).toList();

        BigDecimal total = itemResponses.stream()
                .map(item -> item.price().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(itemResponses, total);
    }

    @Transactional
    public void clearCart(Cart cart) {
        cartItemRepository.deleteAllByCartId(cart.getId());
    }

    @Transactional
    public void updateQuantity(Long productId, Integer quantity) {
        Cart cart = getOrCreateCart();

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Товар не найден в корзине"));

        if (item.getProduct().getStockQuantity() < quantity) {
            throw new IllegalStateException("Недостаточно товара на складе");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
    }

    @Transactional
    public void removeItem(Long productId) {
        Cart cart = getOrCreateCart();
        cartItemRepository.deleteAllByCartIdAndProductId(cart.getId(), productId);
    }

    @Transactional
    public void clearCurrentCart() {
        Cart cart = getOrCreateCart();
        clearCart(cart);
    }
}
