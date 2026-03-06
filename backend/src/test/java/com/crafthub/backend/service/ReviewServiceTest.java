package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.ReviewRequest;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.OrderRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.ReviewRepository;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

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
    void createReview_ShouldSave_WhenOrderCompleted() {
        // Arrange
        String email = "buyer@test.com";
        mockSecurityContext(email);

        User buyer = User.builder().id(1L).email(email).build();
        User seller = User.builder().id(2L).build();
        Product product = Product.builder().id(10L).seller(seller).build();

        Order order = Order.builder()
                .id(100L)
                .buyer(buyer)
                .status(OrderStatus.COMPLETED) // Заказ завершен
                .items(List.of(OrderItem.builder().product(product).build())) // Товар есть в заказе
                .build();

        ReviewRequest request = new ReviewRequest(5, "Good!", 10L, 100L);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(buyer));
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByOrderIdAndProductId(100L, 10L)).thenReturn(false); // Отзыва еще нет

        // Act
        reviewService.createReview(request);

        // Assert
        verify(reviewRepository).save(any(Review.class));
        verify(productRepository).save(product); // Должен пересчитаться рейтинг
        verify(userRepository).save(seller); // Рейтинг продавца тоже
    }

    @Test
    void createReview_ShouldThrow_WhenOrderNotCompleted() {
        // Arrange
        mockSecurityContext("buyer@test.com");
        User buyer = User.builder().id(1L).build();
        Order order = Order.builder().id(100L).buyer(buyer).status(OrderStatus.SHIPPED).build(); // Еще в пути

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(buyer));
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(productRepository.findById(any())).thenReturn(Optional.of(new Product()));

        // Act & Assert
        assertThrows(IllegalStateException.class, () ->
                reviewService.createReview(new ReviewRequest(5, "Bad", 1L, 100L))
        );
    }
}