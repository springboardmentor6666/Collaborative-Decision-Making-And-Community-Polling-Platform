package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.NotificationResponse;
import com.decisionhub.backend.entity.User;

import java.util.List;

public interface NotificationService {

    void notifyUser(User recipient, String message);

    List<NotificationResponse> getMyNotifications();

    long getUnreadCount();

    NotificationResponse markAsRead(Long id);

    void markAllAsRead();
}