package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.ProductRequest;
import com.crafthub.backend.dto.response.ProductResponse;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.CategoryRepository;
import com.crafthub.backend.repository.ProductRepository;
import com.crafthub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Управление товарами
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    // Создание товара (статус PENDING - ждет проверки админом)
    @Transactional
    public ProductResponse createProduct(ProductRequest request, List<MultipartFile> images) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Продавец не найден"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Категория не найдена"));

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .stockQuantity(request.stockQuantity())
                .youtubeVideoId(request.youtubeVideoId())
                .status(ProductStatus.PENDING)
                .category(category)
                .seller(seller)
                .build();

        List<ProductImage> productImages = new ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            String path = fileStorageService.saveFile(images.get(i), "products");
            productImages.add(ProductImage.builder()
                    .imageUrl(path)
                    .isMain(i == request.mainImageIndex())
                    .product(product)
                    .build());
        }
        product.setImages(productImages);

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    // Получить все апрувнутые товары
    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findAllByStatus(ProductStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Получить все товары на ожидании модерации (для админа)
    public List<ProductResponse> getPendingProducts() {
        return productRepository.findAllByStatus(ProductStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    public ProductResponse mapToResponse(Product product) {
        List<ProductResponse.ImageResponse> imageResponses = product.getImages().stream()
                .map(img -> new ProductResponse.ImageResponse(img.getImageUrl(), img.isMain()))
                .toList();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getYoutubeVideoId(),
                product.getStatus().name(),
                product.getCategory().getDisplayName(),
                product.getSeller().getId(),
                product.getSeller().getFullName(),
                product.getSeller().getEmail(),
                product.getAverageRating(),
                product.getReviewsCount(),
                imageResponses
        );
    }

    // Получить мои товары (продавцу)
    public List<ProductResponse> getMyProducts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Продавец не найден"));

        return productRepository.findAllBySellerId(seller.getId()).stream()
                .filter(p -> p.getStatus() != ProductStatus.DELETED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Подтвердить товар
    @Transactional
    public void approveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        product.setStatus(ProductStatus.ACTIVE);
        productRepository.save(product);

        notificationService.createNotification(
                product.getSeller(),
                "Ваш товар '" + product.getName() + "' успешно прошел модерацию!",
                NotificationType.PRODUCT
        );
    }

    // Отклонить товар
    @Transactional
    public void rejectProduct(Long productId, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        product.setStatus(ProductStatus.REJECTED);
        product.setModerationComment(reason);
        productRepository.save(product);

        notificationService.createNotification(
                product.getSeller(),
                "Товар '" + product.getName() + "' отклонен. Причина: " + reason,
                NotificationType.PRODUCT
        );
    }

    // Получить товар по айди
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Товар не найден"));
        return mapToResponse(product);
    }

    // Удалить товар
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = product.getSeller().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("У вас нет прав на удаление этого товара");
        }

        if (isAdmin && !isOwner) {
            notificationService.createNotification(
                    product.getSeller(),
                    "Ваш товар '" + product.getName() + "' был удален администратором.",
                    NotificationType.PRODUCT
            );
        }

        // Удаляем картинки с диска, чтобы не занимали место
        if (product.getImages() != null) {
            product.getImages().forEach(img -> fileStorageService.deleteFile(img.getImageUrl()));
            product.getImages().clear();
        }

        // Ставим новый статус и убираем со склада
        product.setStatus(ProductStatus.DELETED);
        product.setStockQuantity(0);
        product.setModerationComment("Удален безвозвратно");

        productRepository.save(product);
    }

    // Обновить существующий товар
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, List<MultipartFile> images) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!product.getSeller().getEmail().equals(email)) {
            throw new RuntimeException("Вы не можете редактировать чужой товар");
        }

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setYoutubeVideoId(request.youtubeVideoId());

        product.setStatus(ProductStatus.PENDING);

        if (images != null && !images.isEmpty()) {

            product.getImages().forEach(img -> fileStorageService.deleteFile(img.getImageUrl()));

            product.getImages().clear();

            // Сохраняем новые фото
            for (int i = 0; i < images.size(); i++) {
                String path = fileStorageService.saveFile(images.get(i), "products");
                product.getImages().add(ProductImage.builder()
                        .imageUrl(path)
                        .isMain(i == request.mainImageIndex())
                        .product(product)
                        .build());
            }
        }

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    // Получить все товары для админа
    public List<ProductResponse> getAllProductsForAdmin() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStatus() != ProductStatus.DELETED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Снять с публикации (отправить на доработку)
    @Transactional
    public void suspendProduct(Long productId, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        product.setStatus(ProductStatus.REJECTED);
        product.setModerationComment(reason);
        productRepository.save(product);

        notificationService.createNotification(
                product.getSeller(),
                "Ваш товар '" + product.getName() + "' снят с публикации администратором. Причина: " + reason,
                NotificationType.PRODUCT
        );
    }
}