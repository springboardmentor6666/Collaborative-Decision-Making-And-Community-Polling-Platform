package com.decisionhub.entity;

import com.decisionhub.common.enums.ElectionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.common.enums.VotingEventStatus;
import com.decisionhub.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(
        name = "voting_event",
        indexes = {
                @Index(name = "idx_voting_event_community", columnList = "community_id"),
                @Index(name = "idx_voting_event_status", columnList = "status")
        }
)
@SQLDelete(sql = "UPDATE voting_event SET deleted = true WHERE event_id = ?")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VotingEvent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private VotingEventStatus status = VotingEventStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "voting_type", nullable = false, length = 20)
    @Builder.Default
    private VoteType votingType = VoteType.SINGLE;

    @Column(name = "anonymous_voting", nullable = false)
    @Builder.Default
    private boolean anonymousVoting = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "results_visible", nullable = false, length = 50)
    @Builder.Default
    private ElectionVisibility resultsVisible = ElectionVisibility.RESULTS_HIDDEN_DURING_VOTING;

    @Column(name = "results_published", nullable = false)
    @Builder.Default
    private boolean resultsPublished = false;

    @OneToMany(mappedBy = "votingEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VotingCategory> categories = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VotingEvent that = (VotingEvent) o;
        return eventId != null && Objects.equals(eventId, that.eventId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
