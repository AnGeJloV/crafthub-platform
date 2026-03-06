package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.ProductRequest;
import com.crafthub.backend.dto.response.ProductResponse;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.CategoryRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private FileStorageService fileStorageService;
    @Mock private NotificationService notificationService; // Нужно, если есть уведомления

    @InjectMocks
    private ProductService productService;

    // Хак для мока SecurityContext (текущего юзера)
    private void mockSecurityContext(String email) {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(email);
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createProduct_ShouldSaveProduct() {
        // Arrange
        String email = "seller@test.com";
        mockSecurityContext(email);

        User seller = User.builder().id(1L).email(email).build();
        Category category = Category.builder().id(1L).displayName("Wood").build();

        ProductRequest request = new ProductRequest(
                "Table", "Desc", BigDecimal.TEN, 5, 1L, null, 0
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(seller));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        // Мокаем сохранение: возвращаем тот же объект, что и сохраняем
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(100L); // Симулируем присвоение ID базой
            return p;
        });

        // Act
        ProductResponse response = productService.createProduct(request, new ArrayList<>());

        // Assert
        assertNotNull(response);
        assertEquals("Table", response.name());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void deleteProduct_ShouldThrowException_WhenUserIsNotOwnerAndNotAdmin() {
        // Arrange
        String email = "hacker@test.com";
        mockSecurityContext(email);

        User hacker = User.builder().id(2L).email(email).role(Role.ROLE_USER).build();
        User owner = User.builder().id(1L).email("owner@test.com").build();
        Product product = Product.builder().id(50L).seller(owner).name("Table").build();

        when(productRepository.findById(50L)).thenReturn(Optional.of(product));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(hacker));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> productService.deleteProduct(50L));
        verify(productRepository, never()).delete(any());
    }

    @Test
    void approveProduct_ShouldChangeStatusToActive() {
        // Arrange
        Product product = Product.builder().id(1L).status(ProductStatus.PENDING).seller(new User()).build();
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // Act
        productService.approveProduct(1L);

        // Assert
        assertEquals(ProductStatus.ACTIVE, product.getStatus());
        verify(productRepository).save(product);
    }
}