package com.crafthub.backend.service;

import com.crafthub.backend.dto.stats.*;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public SellerStatsResponse getSellerStats() {
        User seller = getCurrentUser();

        // 1. Считаем выручку
        BigDecimal revenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .flatMap(o -> o.getItems().stream())
                .filter(i -> i.getProduct().getSeller().getId().equals(seller.getId()))
                .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Считаем количество продаж
        long salesCount = orderRepository.countSalesBySellerId(seller.getId());

        // 3. Получаем историю для графика и мапим вручную
        List<Object[]> rawHistory = orderRepository.getDailySalesRaw(seller.getId());
        List<ChartPoint> history = rawHistory.stream()
                .map(row -> new ChartPoint(
                        row[0].toString(),
                        ((Number) row[1]).doubleValue()
                ))
                .collect(Collectors.toList());

        // 4. Топ товаров
        var topProducts = productRepository.findTopProductsBySeller(seller.getId(), PageRequest.of(0, 5));

        return new SellerStatsResponse(
                revenue,
                salesCount,
                seller.getAverageRating(),
                history,
                topProducts);
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getAdminStats() {
        BigDecimal gmv = orderRepository.calculateTotalGmv();
        if (gmv == null) gmv = BigDecimal.ZERO;

        return new AdminStatsResponse(
                gmv,
                userRepository.count(),
                userRepository.findAll().stream().filter(u -> u.getRole() == Role.ROLE_SELLER).count(),
                productRepository.count(),
                List.of(),
                orderRepository.countByStatus(OrderStatus.DISPUTED)
        );
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}