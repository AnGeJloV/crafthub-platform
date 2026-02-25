package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.ReviewRequest;
import com.crafthub.backend.dto.response.ReviewResponse;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createReview(ReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User author = userRepository.findByEmail(email).orElseThrow();

        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new RuntimeException("Заказ не найден"));

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Товар не найден"));

        if (!order.getBuyer().getId().equals(author.getId())) {
            throw new IllegalStateException("Вы не можете оставить отзыв на чужой заказ");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Отзыв можно оставить только после завершения сделки");
        }

        boolean hasProduct = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(product.getId()));
        if (!hasProduct) {
            throw new IllegalStateException("Этого товара нет в вашем заказе");
        }

        if (reviewRepository.existsByOrderIdAndProductId(order.getId(), product.getId())) {
            throw new IllegalStateException("Вы уже оставили отзыв по этому заказу");
        }

        Review review = Review.builder()
                .rating(request.rating())
                .comment(request.comment())
                .product(product)
                .author(author)
                .order(order)
                .build();
        reviewRepository.save(review);

        updateProductRating(product);
        updateSellerRating(product.getSeller());
    }

    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findAllByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(r -> new ReviewResponse(
                        r.getId(),
                        r.getRating(),
                        r.getComment(),
                        r.getAuthor().getFullName(),
                        r.getAuthor().getId(),
                        r.getCreatedAt()
                )).toList();
    }

    private void updateProductRating(Product product) {
        Double newRating = reviewRepository.calculateAverageRatingForProduct(product.getId());
        Integer count = reviewRepository.findAllByProductIdOrderByCreatedAtDesc(product.getId()).size();

        newRating = Math.round(newRating * 10.0) / 10.0;

        product.setAverageRating(newRating);
        product.setReviewsCount(count);
        productRepository.save(product);
    }

    private void updateSellerRating(User seller) {
        Double newRating = reviewRepository.calculateAverageRatingForSeller(seller.getId());
        Integer totalReviews = reviewRepository.countReviewsForSeller(seller.getId());

        newRating = Math.round(newRating * 100.0) / 100.0;

        seller.setAverageRating(newRating);
        seller.setReviewsCount(totalReviews);
        userRepository.save(seller);
    }
}