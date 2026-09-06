package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.NotificationRequest;
import com.decisionhub.backend.dto.NotificationResponse;
import com.decisionhub.backend.entity.Community;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Notification;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.exception.CustomException;
import com.decisionhub.backend.repository.CommunityRepository;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.NotificationRepository;
import com.decisionhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private CommunityRepository communityRepository;

    public List<NotificationResponse> getMyNotifications(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, String email) {
        User user = getUserByEmail(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new CustomException("Notification not found", HttpStatus.NOT_FOUND));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new CustomException("Not authorized to modify this notification", HttpStatus.FORBIDDEN);
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = getUserByEmail(email);
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public NotificationResponse createNotification(String email, NotificationRequest req) {
        User user = getUserByEmail(email);

        Decision decision = null;
        if (req.getDecisionId() != null) {
            decision = decisionRepository.findById(req.getDecisionId()).orElse(null);
        }

        Community community = null;
        if (req.getCommunityId() != null) {
            community = communityRepository.findById(req.getCommunityId()).orElse(null);
        }

        Notification notification = new Notification(
                user,
                decision,
                community,
                req.getNotificationType(),
                req.getMessage(),
                false
        );

        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    @Transactional
    public void sendNotification(User targetUser, Decision decision, Community community, String type, String message) {
        if (targetUser == null) return;
        Notification notification = new Notification(targetUser, decision, community, type, message, false);
        notificationRepository.save(notification);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found: " + email, HttpStatus.NOT_FOUND));
    }

    private NotificationResponse mapToResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getUser() != null ? n.getUser().getId() : null,
                n.getDecision() != null ? n.getDecision().getId() : null,
                n.getCommunity() != null ? n.getCommunity().getId() : null,
                n.getNotificationType(),
                n.getMessage(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}
