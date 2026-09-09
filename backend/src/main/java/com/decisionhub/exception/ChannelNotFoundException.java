package com.decisionhub.exception;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: ChannelNotFoundException
 * Architecture Tier: Exception Handling (Cross-Cutting Tier)
 * Package: com.decisionhub.exception
 *
 * Purpose:
 *   Domain exception thrown when a requested chat channel cannot be found by its identifier.
 */

public class ChannelNotFoundException extends RuntimeException {
    public ChannelNotFoundException(String message) {
        super(message);
    }
}
