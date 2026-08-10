package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

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
}