package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.AddToCartRequest;
import com.crafthub.backend.model.Cart;
import com.crafthub.backend.model.CartItem;
import com.crafthub.backend.model.Product;
import com.crafthub.backend.model.User;
import com.crafthub.backend.repository.CartItemRepository;
import com.crafthub.backend.repository.CartRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private void mockSecurityContext(String email) {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(email);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() { SecurityContextHolder.clearContext(); }

    @Test
    void addToCart_ShouldAddNewItem_WhenNotInCart() {
        // Arrange
        String email = "user@test.com";
        mockSecurityContext(email);

        User user = User.builder().id(1L).email(email).build();
        User seller = User.builder().id(2L).build();
        Product product = Product.builder().id(10L).seller(seller).stockQuantity(10).build();
        Cart cart = Cart.builder().user(user).items(new ArrayList<>()).build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        // Act
        cartService.addToCart(new AddToCartRequest(10L, 2));

        // Assert
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void addToCart_ShouldThrow_WhenBuyingOwnProduct() {
        // Arrange
        String email = "seller@test.com";
        mockSecurityContext(email);

        User seller = User.builder().id(1L).email(email).build();
        Product product = Product.builder().id(10L).seller(seller).build(); // Товар принадлежит тому же юзеру

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(seller));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(new Cart())); // Корзина есть
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        // Act & Assert
        assertThrows(IllegalStateException.class, () ->
                cartService.addToCart(new AddToCartRequest(10L, 1))
        );
    }
}