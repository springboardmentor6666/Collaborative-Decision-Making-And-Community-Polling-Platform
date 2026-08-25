package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String optionText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_id")
    private Decision decision;

    @OneToMany(
            mappedBy = "option",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<Vote> votes = new ArrayList<>();
}