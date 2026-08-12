package com.decisionhub.notification.fcm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Firebase Cloud Messaging (FCM) Notification Service placeholder for push notifications.
 */
@Service
@Slf4j
public class FirebaseNotificationService {

    @Async
    public void sendPushNotification(String deviceToken, String title, String body) {
        log.info("Simulating FCM push notification to token [{}]: {} - {}", deviceToken, title, body);
    }
}
