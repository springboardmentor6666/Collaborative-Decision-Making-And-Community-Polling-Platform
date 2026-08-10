package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "decisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Decision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String visibility;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User createdBy;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}