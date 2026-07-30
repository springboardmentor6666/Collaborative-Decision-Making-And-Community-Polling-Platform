package com.decisionhub.service;

public interface EmailService {

    void sendPasswordResetEmail(String toEmail, String resetLink);
}
