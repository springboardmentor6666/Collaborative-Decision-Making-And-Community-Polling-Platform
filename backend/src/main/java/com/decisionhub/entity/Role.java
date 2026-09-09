package com.decisionhub.entity;
/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: Role
 * Architecture Tier: JPA Domain Entity (Persistence Tier)
 * Package: com.decisionhub.entity
 *
 * Purpose:
 *   JPA entity representing the 'Role' database table, defining relational mappings, lifecycle attributes, and domain state.
 */

public enum Role {
    USER,
    MODERATOR,
    ADMIN,
    EXPERT,
    ADVISOR
}
