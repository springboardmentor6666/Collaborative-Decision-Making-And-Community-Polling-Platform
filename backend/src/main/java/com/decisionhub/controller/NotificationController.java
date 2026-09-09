package com.decisionhub.controller;

import com.decisionhub.dto.NotificationPreferenceDto;
import com.decisionhub.dto.NotificationResponse;
import com.decisionhub.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: NotificationController
 * Architecture Tier: REST API Controller (Presentation Tier)
 * Package: com.decisionhub.controller
 *
 * Purpose:
 *   Manages user notifications: listing unread notifications, marking alerts as read, clearing notifications, and managing user notification preferences.
 */
@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for user notification management")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get all notifications", description = "Retrieves all notifications for current authenticated user")
    public ResponseEntity<List<NotificationResponse>> getAllNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserNotifications(authentication.getName()));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", description = "Retrieves unread notifications for current authenticated user")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(authentication.getName()));
    }

    @GetMapping("/count")
    @Operation(summary = "Get unread count", description = "Retrieves count of unread notifications for current authenticated user")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @GetMapping("/preferences")
    @Operation(summary = "Get notification preferences", description = "Retrieves current user's category notification preferences")
    public ResponseEntity<NotificationPreferenceDto> getPreferences(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserPreferences(authentication.getName()));
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update notification preferences", description = "Updates current user's category notification preferences")
    public ResponseEntity<NotificationPreferenceDto> updatePreferences(@RequestBody NotificationPreferenceDto dto,
                                                                      Authentication authentication) {
        return ResponseEntity.ok(notificationService.updateUserPreferences(authentication.getName(), dto));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks a specific notification as read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(notificationService.markAsRead(id, authentication.getName()));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Marks all notifications as read for current authenticated user")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification", description = "Deletes a specific notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        notificationService.deleteNotification(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
