package com.decisionhub.event;

import com.decisionhub.entity.User;
import com.decisionhub.service.EmailService;
import com.decisionhub.service.FcmService;
import com.decisionhub.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final FcmService fcmService;

    public NotificationEventListener(NotificationService notificationService,
                                     EmailService emailService,
                                     FcmService fcmService) {
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.fcmService = fcmService;
    }

    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        User user = event.getTargetUser();
        if (user == null) {
            return;
        }

        logger.info("Handling notification event: type={}, user={}", event.getType(), user.getEmail());

        // 1. Create in-app notification
        notificationService.createNotification(user, event.getType(), event.getMessage());

        // 2. Send Email if email exists
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            String subject = event.getEmailSubject() != null ? event.getEmailSubject() : "Notification - DecisionHub";
            emailService.sendSimpleEmail(user.getEmail(), subject, event.getMessage());
        }

        // 3. Send Push Notification via FCM
        if (user.getFcmToken() != null && !user.getFcmToken().isBlank()) {
            fcmService.sendPushNotification(user.getFcmToken(), "DecisionHub Alert", event.getMessage());
        }
    }
}
