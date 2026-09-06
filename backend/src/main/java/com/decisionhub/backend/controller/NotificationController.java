package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.NotificationRequest;
import com.decisionhub.backend.dto.NotificationResponse;
import com.decisionhub.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.getMyNotifications(email));
    }

    @GetMapping("/unread")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(email));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Long> res = new HashMap<>();
        res.put("count", notificationService.getUnreadCount(email));
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.markAsRead(id, email));
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        notificationService.markAllAsRead(email);
        Map<String, String> res = new HashMap<>();
        res.put("message", "All notifications marked as read");
        return ResponseEntity.ok(res);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<NotificationResponse> createNotification(@Valid @RequestBody NotificationRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.createNotification(email, req));
    }
}
