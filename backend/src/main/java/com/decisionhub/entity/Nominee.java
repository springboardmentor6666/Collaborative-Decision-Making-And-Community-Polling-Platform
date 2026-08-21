package com.decisionhub.entity;

import com.decisionhub.common.enums.NominationStatus;
import com.decisionhub.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.Objects;

@Entity
@Table(
        name = "nominee",
        indexes = {
                @Index(name = "idx_nominee_category", columnList = "category_id")
        }
)
@SQLDelete(sql = "UPDATE nominee SET deleted = true WHERE nominee_id = ?")
@SQLRestriction("deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nominee extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nominee_id")
    private Long nomineeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private VotingCategory votingCategory;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "nomination_status", nullable = false, length = 20)
    @Builder.Default
    private NominationStatus nominationStatus = NominationStatus.APPROVED;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Nominee nominee = (Nominee) o;
        return nomineeId != null && Objects.equals(nomineeId, nominee.nomineeId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
