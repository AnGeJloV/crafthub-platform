package com.crafthub.backend.controller;

import com.crafthub.backend.dto.request.OrderRequest;
import com.crafthub.backend.dto.response.OrderResponse;
import com.crafthub.backend.model.OrderStatus;
import com.crafthub.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<List<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/my-purchases")
    public ResponseEntity<List<OrderResponse>> getMyPurchases() {
        return ResponseEntity.ok(orderService.getMyPurchases());
    }

    @GetMapping("/my-sales")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<OrderResponse>> getMySales() {
        return ResponseEntity.ok(orderService.getMySales());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id, @RequestBody String reason) {
        orderService.cancelOrder(id, reason);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/dispute")
    public ResponseEntity<Void> openDispute(@PathVariable Long id) {
        orderService.openDispute(id);
        return ResponseEntity.ok().build();
    }

}
