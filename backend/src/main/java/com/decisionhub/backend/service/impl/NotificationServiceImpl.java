package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.NotificationResponse;
import com.decisionhub.backend.entity.Notification;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.NotificationRepository;
import com.decisionhub.backend.service.CurrentUserService;
import com.decisionhub.backend.service.NotificationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notifications;
    private final CurrentUserService currentUser;

    public NotificationServiceImpl(NotificationRepository notifications, CurrentUserService currentUser) {
        this.notifications = notifications;
        this.currentUser = currentUser;
    }

    @Override
    public void notifyUser(User recipient, String message) {

        if (recipient == null) {
            return;
        }

        Notification notification = Notification.builder()
                .message(message)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .user(recipient)
                .build();

        notifications.save(notification);
    }

    @Override
    public List<NotificationResponse> getMyNotifications() {

        User user = currentUser.get();

        return notifications.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount() {

        User user = currentUser.get();
        return notifications.countByUserIdAndReadStatusFalse(user.getId());
    }

    @Override
    public NotificationResponse markAsRead(Long id) {

        User user = currentUser.get();

        Notification notification = notifications.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only manage your own notifications");
        }

        notification.setReadStatus(true);

        return toResponse(notifications.save(notification));
    }

    @Override
    public void markAllAsRead() {

        User user = currentUser.get();

        List<Notification> unread = notifications.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(n -> !n.isReadStatus())
                .collect(Collectors.toList());

        unread.forEach(n -> n.setReadStatus(true));

        notifications.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .read(n.isReadStatus())
                .createdAt(n.getCreatedAt())
                .build();
    }
}