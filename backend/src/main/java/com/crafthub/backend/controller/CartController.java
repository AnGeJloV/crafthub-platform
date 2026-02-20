package com.crafthub.backend.controller;

import com.crafthub.backend.dto.request.AddToCartRequest;
import com.crafthub.backend.dto.response.CartResponse;
import com.crafthub.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Контроллер для управления корзиной покупок.
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getCartResponse());
    }

    @PostMapping("/add")
    public ResponseEntity<Void> addToCart(@Valid @RequestBody AddToCartRequest request) {
        cartService.addToCart(request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        cartService.updateQuantity(productId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long productId) {
        cartService.removeItem(productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCurrentCart();
        return ResponseEntity.ok().build();
    }
}