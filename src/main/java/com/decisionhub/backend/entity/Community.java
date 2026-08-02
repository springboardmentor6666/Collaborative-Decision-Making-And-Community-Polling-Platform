package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "communities")
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, unique = true)
    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 100)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Community() {
    }

    public Community(String name, String description, String category, User creator) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.creator = creator;
    }

    public Community(Long id, String name, String description, String category, User creator) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.creator = creator;
    }

    // Custom Builder
    public static CommunityBuilder builder() {
        return new CommunityBuilder();
    }

    public static class CommunityBuilder {
        private Long id;
        private String name;
        private String description;
        private String category;
        private User creator;

        public CommunityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CommunityBuilder name(String name) {
            this.name = name;
            return this;
        }

        public CommunityBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CommunityBuilder category(String category) {
            this.category = category;
            return this;
        }

        public CommunityBuilder creator(User creator) {
            this.creator = creator;
            return this;
        }

        public Community build() {
            return new Community(id, name, description, category, creator);
        }
    }

    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
