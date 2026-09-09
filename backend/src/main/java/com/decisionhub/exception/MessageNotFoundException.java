package com.decisionhub.exception;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: MessageNotFoundException
 * Architecture Tier: Exception Handling (Cross-Cutting Tier)
 * Package: com.decisionhub.exception
 *
 * Purpose:
 *   Domain exception thrown when a chat message or reply target cannot be resolved.
 */

public class MessageNotFoundException extends RuntimeException {
    public MessageNotFoundException(String message) {
        super(message);
    }
}
