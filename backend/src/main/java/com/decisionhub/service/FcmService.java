package com.decisionhub.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;

@Service
public class FcmService {

    private static final Logger logger = LoggerFactory.getLogger(FcmService.class);

    @Value("${app.firebase.config-path:}")
    private String firebaseConfigPath;

    @Value("${app.firebase.enabled:false}")
    private boolean firebaseEnabled;

    private boolean isInitialized = false;

    @PostConstruct
    public void init() {
        if (firebaseEnabled && firebaseConfigPath != null && !firebaseConfigPath.isBlank()) {
            try (FileInputStream serviceAccount = new FileInputStream(firebaseConfigPath)) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(com.google.auth.oauth2.GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                }
                isInitialized = true;
                logger.info("Firebase Admin SDK successfully initialized.");
            } catch (Exception e) {
                logger.warn("Failed to initialize Firebase Admin SDK: {}", e.getMessage());
            }
        }
    }

    public void sendPushNotification(String fcmToken, String title, String body) {
        if (fcmToken == null || fcmToken.isBlank()) {
            return;
        }
        if (!isInitialized) {
            logger.info("FCM push simulation -> Target Token: {}, Title: '{}', Body: '{}'", fcmToken, title, body);
            return;
        }

        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            logger.info("Successfully sent FCM message: {}", response);
        } catch (Exception e) {
            logger.error("Error sending FCM push notification to token {}: {}", fcmToken, e.getMessage());
        }
    }
}
