package com.decisionhub.exception;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: PollNotFoundException
 * Architecture Tier: Exception Handling (Cross-Cutting Tier)
 * Package: com.decisionhub.exception
 *
 * Purpose:
 *   Domain exception thrown when a poll associated with a decision is missing or invalid.
 */

public class PollNotFoundException extends RuntimeException {
    public PollNotFoundException(String message) {
        super(message);
    }
}
