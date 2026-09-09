package com.decisionhub.service;

import com.decisionhub.dto.NotificationPreferenceDto;
import com.decisionhub.dto.NotificationResponse;
import com.decisionhub.entity.Notification;
import com.decisionhub.entity.NotificationPreference;
import com.decisionhub.entity.User;
import com.decisionhub.repository.NotificationPreferenceRepository;
import com.decisionhub.repository.NotificationRepository;
import com.decisionhub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: NotificationService
 * Architecture Tier: Business Service (Service Tier)
 * Package: com.decisionhub.service
 *
 * Purpose:
 *   Dispatches in-app notifications to users upon comments, votes, mentions, and community invites, tracking read/unread statuses.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               NotificationPreferenceRepository notificationPreferenceRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationPreferenceRepository = notificationPreferenceRepository;
    }

    @Transactional
    public NotificationResponse createNotification(User user, String type, String message) {
        if (user == null) return null;

        // 1. Check user notification preferences
        if (!isNotificationAllowed(user, type)) {
            log.debug("Notification suppressed by user preference: type={}, user={}", type, user.getEmail());
            return null;
        }

        // 2. Prevent duplicate notifications for identical type & message within the last 60 seconds
        LocalDateTime recentThreshold = LocalDateTime.now().minusSeconds(60);
        boolean duplicateExists = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(n -> n.getCreatedAt() != null && n.getCreatedAt().isAfter(recentThreshold))
                .anyMatch(n -> n.getType().equalsIgnoreCase(type) && n.getMessage().equalsIgnoreCase(message));

        if (duplicateExists) {
            log.debug("Duplicate notification suppressed: type={}, user={}", type, user.getEmail());
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notification.setIsRead(false);
        Notification saved = notificationRepository.save(notification);
        return mapToNotificationResponse(saved);
    }

    public boolean isNotificationAllowed(User user, String type) {
        if (user == null) return false;
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> new NotificationPreference(user));

        if (type == null) return true;
        String t = type.toUpperCase().trim();

        return switch (t) {
            case "COMMUNITY_ACTIVITY", "COMMUNITY_POST" -> pref.getCommunityActivity();
            case "COMMUNITY_UPDATE", "COMMUNITY_UPDATED" -> pref.getCommunityUpdates();
            case "NEW_COMMENT", "COMMENT" -> pref.getComments();
            case "COMMENT_REPLY", "REPLY" -> pref.getCommentReplies();
            case "NEW_DISCUSSION", "DISCUSSION", "CHAT_MESSAGE" -> pref.getDiscussions();
            case "MENTION" -> pref.getMentions();
            case "NEW_VOTE", "VOTING_REMINDER", "POLL_ENDED", "POLL_RESULTS_AVAILABLE" -> pref.getVotingActivity();
            case "DECISION_UPDATED", "DECISION_RESOLVED" -> pref.getDecisionActivity();
            case "COMMUNITY_INVITE", "INVITE" -> pref.getCommunityInvites();
            case "ACCOUNT_ALERT", "SYSTEM", "MODERATION_ACTION" -> pref.getAccountAlerts();
            default -> true;
        };
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceDto getUserPreferences(String userEmail) {
        User user = getUserByEmail(userEmail);
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> new NotificationPreference(user));

        return mapToPreferenceDto(pref);
    }

    @Transactional
    public NotificationPreferenceDto updateUserPreferences(String userEmail, NotificationPreferenceDto dto) {
        User user = getUserByEmail(userEmail);
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    NotificationPreference np = new NotificationPreference(user);
                    return np;
                });

        if (dto.getCommunityActivity() != null) pref.setCommunityActivity(dto.getCommunityActivity());
        if (dto.getCommunityUpdates() != null) pref.setCommunityUpdates(dto.getCommunityUpdates());
        if (dto.getComments() != null) pref.setComments(dto.getComments());
        if (dto.getCommentReplies() != null) pref.setCommentReplies(dto.getCommentReplies());
        if (dto.getDiscussions() != null) pref.setDiscussions(dto.getDiscussions());
        if (dto.getMentions() != null) pref.setMentions(dto.getMentions());
        if (dto.getVotingActivity() != null) pref.setVotingActivity(dto.getVotingActivity());
        if (dto.getDecisionActivity() != null) pref.setDecisionActivity(dto.getDecisionActivity());
        if (dto.getCommunityInvites() != null) pref.setCommunityInvites(dto.getCommunityInvites());
        if (dto.getAccountAlerts() != null) pref.setAccountAlerts(dto.getAccountAlerts());

        NotificationPreference saved = notificationPreferenceRepository.save(pref);
        return mapToPreferenceDto(saved);
    }

    private NotificationPreferenceDto mapToPreferenceDto(NotificationPreference pref) {
        return new NotificationPreferenceDto(
                pref.getCommunityActivity(),
                pref.getCommunityUpdates(),
                pref.getComments(),
                pref.getCommentReplies(),
                pref.getDiscussions(),
                pref.getMentions(),
                pref.getVotingActivity(),
                pref.getDecisionActivity(),
                pref.getCommunityInvites(),
                pref.getAccountAlerts()
        );
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String userEmail) {
        User user = getUserByEmail(userEmail);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(String userEmail) {
        User user = getUserByEmail(userEmail);
        return notificationRepository.findByUserIdAndIsReadFalse(user.getId()).stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = getUserByEmail(userEmail);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to modify this notification");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToNotificationResponse(saved);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Notification> unreadList = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        for (Notification notification : unreadList) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadList);
    }

    @Transactional
    public void deleteNotification(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    public NotificationResponse mapToNotificationResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUser() != null ? notification.getUser().getId() : null,
                notification.getType(),
                notification.getMessage(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}
