package com.crafthub.backend.controller;

import com.crafthub.backend.dto.stats.*;
import com.crafthub.backend.model.User;
import com.crafthub.backend.service.ReportService;
import com.crafthub.backend.service.StatisticsService;
import com.crafthub.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final UserService userService;
    private final ReportService reportService;

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerStatsResponse> getSellerStats() {
        return ResponseEntity.ok(statisticsService.getSellerStats());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(statisticsService.getAdminStats());
    }

    @GetMapping("/seller/report")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<byte[]> getSellerReport() {
        User seller = userService.getCurrentUser();
        byte[] pdf = reportService.generateSellerReport(seller);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=sales_report.pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/admin/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> getAdminReport() {
        byte[] pdf = reportService.generateAdminReport();

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=admin_report.pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}