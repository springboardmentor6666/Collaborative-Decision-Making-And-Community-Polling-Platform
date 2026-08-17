package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "votes", uniqueConstraints = @UniqueConstraint(name = "uk_vote_user_decision", columnNames = {"user_id", "decision_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    @ManyToOne
    @JoinColumn(name = "option_id", nullable = false)
    private Option option;
}
