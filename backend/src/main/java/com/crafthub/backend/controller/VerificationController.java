package com.crafthub.backend.controller;

import com.crafthub.backend.dto.request.VerificationDecisionRequest;
import com.crafthub.backend.model.VerificationRequest;
import com.crafthub.backend.model.VerificationStatus;
import com.crafthub.backend.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Контроллер для обработки заявок на верификацию.
 */
@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/apply")
    public ResponseEntity<String> apply(
            @RequestParam("legalInfo") String legalInfo,
            @RequestParam("file") MultipartFile file
    ) {
        verificationService.applyForVerification(legalInfo, file);
        return ResponseEntity.ok("Заявка успешно подана и находится на рассмотрении");
    }

    // Получить список всех заявок
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VerificationRequest>> getPendingRequests() {
        return ResponseEntity.ok(verificationService.getPendingRequests());
    }

    // Одобрить заявку
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> approve(@PathVariable Long id) {
        verificationService.processDecision(id, VerificationStatus.APPROVED, null);
        return ResponseEntity.ok("Заявка одобрена, пользователь стал продавцом");
    }

    // Отклонить заявку
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> reject(@PathVariable Long id, @RequestBody VerificationDecisionRequest decision) {
        verificationService.processDecision(id, VerificationStatus.REJECTED, decision.reason());
        return ResponseEntity.ok("Заявка отклонена");
    }
}