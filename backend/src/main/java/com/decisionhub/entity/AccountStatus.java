package com.decisionhub.entity;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: AccountStatus
 * Architecture Tier: JPA Domain Entity (Persistence Tier)
 * Package: com.decisionhub.entity
 *
 * Purpose:
 *   JPA entity representing the 'AccountStatus' database table, defining relational mappings, lifecycle attributes, and domain state.
 */

public enum AccountStatus {
    ACTIVE,
    DEACTIVATED,
    PENDING_DELETION,
    DELETED
}
