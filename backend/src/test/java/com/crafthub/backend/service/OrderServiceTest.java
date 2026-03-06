package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.OrderRequest;
import com.crafthub.backend.dto.response.OrderResponse;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.OrderRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.UserRepository;
import com.crafthub.backend.repository.ReviewRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private CartService cartService;
    @Mock private NotificationService notificationService;
    @Mock private ReviewRepository reviewRepository;

    @InjectMocks
    private OrderService orderService;

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
    void createOrder_ShouldCalculateTotalAndReduceStock() {
        // Arrange
        String email = "buyer@test.com";
        mockSecurityContext(email);

        User buyer = User.builder().id(1L).email(email).build();
        User seller = User.builder().id(2L).fullName("Seller").build();

        Product product = Product.builder()
                .id(10L)
                .name("Cup")
                .price(new BigDecimal("100.00"))
                .stockQuantity(10)
                .seller(seller)
                .build();

        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(10L, 2);
        OrderRequest request = new OrderRequest("Minsk, Lenin st.", List.of(itemReq));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(buyer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(777L);
            o.setCreatedAt(java.time.LocalDateTime.now());
            return o;
        });

        // Act
        List<OrderResponse> responses = orderService.createOrder(request);

        // Assert
        assertEquals(1, responses.size());
        assertEquals(new BigDecimal("200.00"), responses.get(0).totalAmount()); // 100 * 2 = 200
        assertEquals(8, product.getStockQuantity()); // Было 10, купили 2, стало 8

        verify(productRepository).save(product); // Проверяем, что товар обновился в БД
        verify(notificationService).createNotification(eq(seller), anyString(), eq(NotificationType.ORDER));
    }

    @Test
    void createOrder_ShouldThrowException_WhenNotEnoughStock() {
        // Arrange
        mockSecurityContext("buyer@test.com");
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(new User()));

        Product product = Product.builder().id(10L).stockQuantity(1).build(); // На складе 1 шт
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        OrderRequest.OrderItemRequest itemReq = new OrderRequest.OrderItemRequest(10L, 5); // Хотим купить 5
        OrderRequest request = new OrderRequest("Addr", List.of(itemReq));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> orderService.createOrder(request));
    }
}