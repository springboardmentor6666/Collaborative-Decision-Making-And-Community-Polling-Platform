package com.decisionhub.exception;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: UserNotFoundException
 * Architecture Tier: Exception Handling (Cross-Cutting Tier)
 * Package: com.decisionhub.exception
 *
 * Purpose:
 *   Domain exception thrown when an authentication or profile lookup fails to locate the specified user.
 */

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
