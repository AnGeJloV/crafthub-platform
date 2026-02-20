package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.ProductRequest;
import com.crafthub.backend.dto.response.ProductResponse;
import com.crafthub.backend.model.Category;
import com.crafthub.backend.model.Product;
import com.crafthub.backend.model.User;
import com.crafthub.backend.repository.CategoryRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile image) {
        // Получаем текущего пользователя (продавца)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Продавец не найден"));

        // Находим категорию
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Категория не найдена"));

        // Сохраняем изображение товара
        String imageUrl = fileStorageService.saveFile(image, "products");

        // Создаем товар
        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .stockQuantity(request.stockQuantity())
                .category(category)
                .seller(seller)
                .imageUrl(imageUrl)
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.getCategory().getDisplayName(),
                product.getSeller().getFullName(),
                product.getSeller().getEmail()
        );
    }

    public List<ProductResponse> getMyProducts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Продавец не найден"));

        return productRepository.findAllBySellerId(seller.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}