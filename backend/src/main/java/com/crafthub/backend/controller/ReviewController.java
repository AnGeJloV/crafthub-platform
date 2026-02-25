package com.crafthub.backend.controller;

import com.crafthub.backend.dto.request.ReviewRequest;
import com.crafthub.backend.dto.response.ReviewResponse;
import com.crafthub.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Void> createReview(@RequestBody @Valid ReviewRequest request) {
        reviewService.createReview(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @PatchMapping("/{id}/report")
    public ResponseEntity<Void> reportReview(@PathVariable Long id) {
        reviewService.reportReview(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/reported")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getReportedReviews() {
        return ResponseEntity.ok(reviewService.getReportedReviews());
    }

    @PatchMapping("/admin/{id}/ignore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> ignoreReport(@PathVariable Long id) {
        reviewService.ignoreReport(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok().build();
    }
}