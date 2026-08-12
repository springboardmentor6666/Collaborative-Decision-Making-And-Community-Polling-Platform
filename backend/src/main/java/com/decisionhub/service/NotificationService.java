package com.decisionhub.service;

import com.decisionhub.common.enums.NotificationType;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.NotificationResponse;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    void sendNotification(Long userId, String title, String message, NotificationType type);

    PagedResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    long getUnreadCount(Long userId);
}
