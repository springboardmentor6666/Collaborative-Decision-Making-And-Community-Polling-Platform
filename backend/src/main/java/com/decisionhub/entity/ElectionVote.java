package com.decisionhub.entity;

import com.decisionhub.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.Objects;

@Entity
@Table(
        name = "election_vote",
        uniqueConstraints = {
                // Helps enforce SINGLE_CHOICE limit at DB level
                @UniqueConstraint(name = "uk_election_vote_user_category", columnNames = {"user_id", "category_id"})
        },
        indexes = {
                @Index(name = "idx_election_vote_user", columnList = "user_id"),
                @Index(name = "idx_election_vote_event", columnList = "event_id"),
                @Index(name = "idx_election_vote_category", columnList = "category_id"),
                @Index(name = "idx_election_vote_nominee", columnList = "nominee_id")
        }
)
@SQLDelete(sql = "UPDATE election_vote SET deleted = true WHERE vote_id = ?")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectionVote extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_id")
    private Long voteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private VotingEvent votingEvent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private VotingCategory votingCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nominee_id", nullable = false)
    private Nominee nominee;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ElectionVote that = (ElectionVote) o;
        return voteId != null && Objects.equals(voteId, that.voteId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
