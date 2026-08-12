package com.decisionhub.notification.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "spring.mail.host")
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${application.mail.from-email:no-reply@decisionhub.com}")
    private String fromEmail;

    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
            log.info("Successfully sent HTML email to: {}", to);
        } catch (MessagingException ex) {
            log.error("Failed to dispatch email to {}: {}", to, ex.getMessage());
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;
        String htmlContent = "<h2>Password Reset Request</h2>" +
                "<p>Click the link below to reset your DecisionHub password:</p>" +
                "<a href=\"" + resetUrl + "\">Reset Password</a>";
        sendHtmlEmail(toEmail, "DecisionHub - Password Reset Request", htmlContent);
    }

    @Override
    @Async
    public void sendPollClosedEmail(String toEmail, String decisionTitle, String winnerTitle) {
        String htmlContent = "<h2>Poll Closed: " + decisionTitle + "</h2>" +
                "<p>The voting period has ended. The winning option is: <strong>" + winnerTitle + "</strong></p>";
        sendHtmlEmail(toEmail, "DecisionHub - Poll Closed Results", htmlContent);
    }
}
