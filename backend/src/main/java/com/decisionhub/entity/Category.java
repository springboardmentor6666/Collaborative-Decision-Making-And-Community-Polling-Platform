package com.decisionhub.entity;

import jakarta.persistence.*;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: Category
 * Architecture Tier: JPA Domain Entity (Persistence Tier)
 * Package: com.decisionhub.entity
 *
 * Purpose:
 *   JPA entity representing the 'Category' database table, defining relational mappings, lifecycle attributes, and domain state.
 */
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    public Category() {
    }

    public Category(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
