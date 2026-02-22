package com.crafthub.backend.controller;

import com.crafthub.backend.model.Notification;
import com.crafthub.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        return ResponseEntity.ok(notificationService.getMyNotifications());
    }

    @PostMapping("/mark-as-read")
    public ResponseEntity<Void> markAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}