package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "decisions")
public class Decision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    @Size(max = 100)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Decision() {
    }

    public Decision(String title, String description, Boolean isPublic, String category, User creator) {
        this.title = title;
        this.description = description;
        this.isPublic = isPublic;
        this.category = category;
        this.creator = creator;
    }

    public Decision(Long id, String title, String description, Boolean isPublic, String category, User creator) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isPublic = isPublic;
        this.category = category;
        this.creator = creator;
    }

    // Custom Builder
    public static DecisionBuilder builder() {
        return new DecisionBuilder();
    }

    public static class DecisionBuilder {
        private Long id;
        private String title;
        private String description;
        private Boolean isPublic = true;
        private String category;
        private User creator;

        public DecisionBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public DecisionBuilder title(String title) {
            this.title = title;
            return this;
        }

        public DecisionBuilder description(String description) {
            this.description = description;
            return this;
        }

        public DecisionBuilder isPublic(Boolean isPublic) {
            this.isPublic = isPublic;
            return this;
        }

        public DecisionBuilder category(String category) {
            this.category = category;
            return this;
        }

        public DecisionBuilder creator(User creator) {
            this.creator = creator;
            return this;
        }

        public Decision build() {
            return new Decision(id, title, description, isPublic, category, creator);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
