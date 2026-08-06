package com.decisionhub.entity;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.entity.base.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(
        name = "decision",
        indexes = {
                @Index(name = "idx_decision_created_by", columnList = "created_by"),
                @Index(name = "idx_decision_community", columnList = "community_id"),
                @Index(name = "idx_decision_status", columnList = "status")
        }
)
@SQLDelete(sql = "UPDATE decision SET deleted = true WHERE decision_id = ?")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Decision extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "decision_id")
    private Long decisionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false, length = 20)
    @Builder.Default
    private VoteType voteType = VoteType.SINGLE;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    @Builder.Default
    private DecisionVisibility visibility = DecisionVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private DecisionStatus status = DecisionStatus.ACTIVE;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "allow_anonymous_vote", nullable = false)
    @Builder.Default
    private boolean allowAnonymousVote = false;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private int likeCount = 0;

    @Column(name = "share_count", nullable = false)
    @Builder.Default
    private int shareCount = 0;

    @OneToMany(mappedBy = "decision", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Option> options = new ArrayList<>();

    public void addOption(Option option) {
        options.add(option);
        option.setDecision(this);
    }

    public void removeOption(Option option) {
        options.remove(option);
        option.setDecision(null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Decision decision = (Decision) o;
        return decisionId != null && Objects.equals(decisionId, decision.decisionId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
