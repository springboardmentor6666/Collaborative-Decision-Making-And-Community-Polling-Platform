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
    @Column(name = "community_id")
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "community_name", nullable = false)
    private String communityName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 100)
    private String category;

    @Column(name = "member_count")
    private Integer memberCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id", nullable = false)
    private User moderator;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Community() {
    }

    public Community(String communityName, String description, String category, User moderator) {
        this.communityName = communityName;
        this.description = description;
        this.category = category;
        this.moderator = moderator;
        this.memberCount = 0;
    }

    public Community(Long id, String communityName, String description, String category, Integer memberCount, User moderator) {
        this.id = id;
        this.communityName = communityName;
        this.description = description;
        this.category = category;
        this.memberCount = memberCount;
        this.moderator = moderator;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCommunityName() {
        return communityName;
    }

    public void setCommunityName(String communityName) {
        this.communityName = communityName;
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

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public User getModerator() {
        return moderator;
    }

    public void setModerator(User moderator) {
        this.moderator = moderator;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
