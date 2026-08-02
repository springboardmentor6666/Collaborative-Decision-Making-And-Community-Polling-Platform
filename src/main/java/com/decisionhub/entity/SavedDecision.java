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
        name = "saved_decision",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_saved_decision", columnNames = {"user_id", "decision_id"})
        },
        indexes = {
                @Index(name = "idx_saved_decision_user", columnList = "user_id"),
                @Index(name = "idx_saved_decision_decision", columnList = "decision_id")
        }
)
@SQLDelete(sql = "UPDATE saved_decision SET deleted = true WHERE saved_id = ?")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedDecision extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saved_id")
    private Long savedId;

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
        SavedDecision that = (SavedDecision) o;
        return savedId != null && Objects.equals(savedId, that.savedId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
