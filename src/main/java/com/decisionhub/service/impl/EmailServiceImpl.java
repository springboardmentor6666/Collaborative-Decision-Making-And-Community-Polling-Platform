package com.decisionhub.service.impl;

import com.decisionhub.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        log.info("Sending password reset email to: {} with link: {}", toEmail, resetLink);
    }
}
