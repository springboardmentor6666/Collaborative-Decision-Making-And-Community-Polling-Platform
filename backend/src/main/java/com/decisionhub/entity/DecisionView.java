package com.decisionhub.entity;

import com.decisionhub.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.Objects;

@Entity
@Table(
        name = "decision_view",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_decision_view", columnNames = {"user_id", "decision_id"})
        },
        indexes = {
                @Index(name = "idx_decision_view_user", columnList = "user_id"),
                @Index(name = "idx_decision_view_decision", columnList = "decision_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionView extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "view_id")
    private Long viewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DecisionView that = (DecisionView) o;
        return viewId != null && Objects.equals(viewId, that.viewId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
