package com.decisionhub.exception;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: DecisionNotFoundException
 * Architecture Tier: Exception Handling (Cross-Cutting Tier)
 * Package: com.decisionhub.exception
 *
 * Purpose:
 *   Domain exception thrown when a requested decision does not exist, is private, or has been soft-deleted.
 */

public class DecisionNotFoundException extends RuntimeException {
    public DecisionNotFoundException(String message) {
        super(message);
    }
}
