package com.decisionhub.service;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: EmailService
 * Architecture Tier: Business Service (Service Tier)
 * Package: com.decisionhub.service
 *
 * Purpose:
 *   Interface defining transactional email capabilities (welcome emails, password reset links, notification digests).
 */

public interface EmailService {
    void sendSimpleEmail(String to, String subject, String body);
    void sendHtmlEmail(String to, String subject, String htmlContent);
}
