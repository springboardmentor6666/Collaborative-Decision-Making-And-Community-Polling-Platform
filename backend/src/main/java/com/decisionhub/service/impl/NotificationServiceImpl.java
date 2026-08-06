package com.decisionhub.service.impl;

import com.decisionhub.common.enums.NotificationType;
import com.decisionhub.common.response.PagedResponse;
import com.decisionhub.dto.response.NotificationResponse;
import com.decisionhub.entity.Notification;
import com.decisionhub.entity.User;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.mapper.NotificationMapper;
import com.decisionhub.repository.NotificationRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional
    public void sendNotification(Long userId, String title, String message, NotificationType type) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        Notification notification = Notification.builder()
                .user(recipient)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build();

        notificationRepository.save(notification);
        log.info("Dispatched notification to user ID {}: [{}] {}", userId, type, title);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        Page<NotificationResponse> page = notificationRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toResponse);
        return PagedResponse.fromPage(page);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification", "id", notificationId));
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("Cannot modify notifications belonging to another user.");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserUserIdAndRead(userId, false);
    }
}
