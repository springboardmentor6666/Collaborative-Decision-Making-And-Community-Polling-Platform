package com.decisionhub.notification.email;

public interface EmailService {

    void sendHtmlEmail(String to, String subject, String body);

    void sendPasswordResetEmail(String toEmail, String resetToken);

    void sendPollClosedEmail(String toEmail, String decisionTitle, String winnerTitle);
}
