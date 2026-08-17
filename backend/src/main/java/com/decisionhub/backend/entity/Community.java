package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "communities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String communityName;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(name = "community_members", joinColumns = @JoinColumn(name = "community_id"), inverseJoinColumns = @JoinColumn(name = "user_id"), uniqueConstraints = @UniqueConstraint(name = "uk_community_member", columnNames = {"community_id", "user_id"}))
    @Builder.Default
    private Set<User> members = new HashSet<>();

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
