package com.decisionhub.entity;

import jakarta.persistence.*;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: ComparisonFactor
 * Architecture Tier: JPA Domain Entity (Persistence Tier)
 * Package: com.decisionhub.entity
 *
 * Purpose:
 *   JPA entity representing the 'ComparisonFactor' database table, defining relational mappings, lifecycle attributes, and domain state.
 */
@Entity
@Table(name = "comparison_factors")
public class ComparisonFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    @Column(nullable = false, length = 50)
    private String name;

    public ComparisonFactor() {
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Decision getDecision() {
        return decision;
    }

    public void setDecision(Decision decision) {
        this.decision = decision;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
