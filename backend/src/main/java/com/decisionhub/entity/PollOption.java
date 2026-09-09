package com.decisionhub.entity;

import jakarta.persistence.*;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: PollOption
 * Architecture Tier: JPA Domain Entity (Persistence Tier)
 * Package: com.decisionhub.entity
 *
 * Purpose:
 *   JPA entity representing the 'PollOption' database table, defining relational mappings, lifecycle attributes, and domain state.
 */
@Entity
@Table(name = "poll_options")
public class PollOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private DecisionOption option;

    public PollOption() {
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Poll getPoll() {
        return poll;
    }

    public void setPoll(Poll poll) {
        this.poll = poll;
    }

    public DecisionOption getOption() {
        return option;
    }

    public void setOption(DecisionOption option) {
        this.option = option;
    }
}
