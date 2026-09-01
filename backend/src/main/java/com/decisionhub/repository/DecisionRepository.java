package com.decisionhub.repository;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.entity.Decision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, Long>, JpaSpecificationExecutor<Decision> {

    Page<Decision> findByVisibilityAndStatus(DecisionVisibility visibility, DecisionStatus status, Pageable pageable);



    Page<Decision> findByCommunityCommunityIdAndStatus(Long communityId, DecisionStatus status, Pageable pageable);
    
    long countByCommunityCommunityId(Long communityId);

    @Query("SELECT d FROM Decision d WHERE d.createdBy.userId = :userId")
    Page<Decision> findByCreatedByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(d) FROM Decision d WHERE d.createdBy.userId = :userId AND d.status = :status")
    long countByCreatedByUserIdAndStatus(@Param("userId") Long userId, @Param("status") DecisionStatus status);

    @Query("SELECT d FROM Decision d LEFT JOIN d.community c WHERE d.status = com.decisionhub.common.enums.DecisionStatus.ACTIVE AND " +
           "( ((d.visibility = com.decisionhub.common.enums.DecisionVisibility.PUBLIC OR d.visibility IS NULL) AND (c IS NULL OR c.visibility = com.decisionhub.common.enums.CommunityVisibility.PUBLIC OR c.visibility IS NULL)) " +
           "  OR (:userId IS NOT NULL AND d.createdBy.userId = :userId) " +
           "  OR (:userId IS NOT NULL AND c IS NOT NULL AND EXISTS (SELECT 1 FROM CommunityMember cm WHERE cm.community = c AND cm.user.userId = :userId AND cm.status = com.decisionhub.common.enums.MemberStatus.ACTIVE)) ) " +
           "ORDER BY (d.viewCount + d.likeCount + d.shareCount) DESC")
    Page<Decision> findTrendingDecisions(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT d FROM Decision d LEFT JOIN d.community c WHERE d.status = com.decisionhub.common.enums.DecisionStatus.ACTIVE AND " +
           "( ((d.visibility = com.decisionhub.common.enums.DecisionVisibility.PUBLIC OR d.visibility IS NULL) AND (c IS NULL OR c.visibility = com.decisionhub.common.enums.CommunityVisibility.PUBLIC OR c.visibility IS NULL)) " +
           "  OR (:userId IS NOT NULL AND d.createdBy.userId = :userId) " +
           "  OR (:userId IS NOT NULL AND c IS NOT NULL AND EXISTS (SELECT 1 FROM CommunityMember cm WHERE cm.community = c AND cm.user.userId = :userId AND cm.status = com.decisionhub.common.enums.MemberStatus.ACTIVE)) ) " +
           "ORDER BY d.viewCount DESC")
    Page<Decision> findPopularDecisions(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT d FROM Decision d LEFT JOIN d.community c WHERE d.status = com.decisionhub.common.enums.DecisionStatus.ACTIVE AND " +
           "( ((d.visibility = com.decisionhub.common.enums.DecisionVisibility.PUBLIC OR d.visibility IS NULL) AND (c IS NULL OR c.visibility = com.decisionhub.common.enums.CommunityVisibility.PUBLIC OR c.visibility IS NULL)) " +
           "  OR (:userId IS NOT NULL AND d.createdBy.userId = :userId) " +
           "  OR (:userId IS NOT NULL AND c IS NOT NULL AND EXISTS (SELECT 1 FROM CommunityMember cm WHERE cm.community = c AND cm.user.userId = :userId AND cm.status = com.decisionhub.common.enums.MemberStatus.ACTIVE)) ) " +
           "ORDER BY d.createdAt DESC")
    Page<Decision> findLatestDecisions(@Param("userId") Long userId, Pageable pageable);

    @Modifying
    @Query("UPDATE Decision d SET d.viewCount = d.viewCount + 1 WHERE d.decisionId = :decisionId")
    void incrementViewCount(@Param("decisionId") Long decisionId);

    @Modifying
    @Query("UPDATE Decision d SET d.likeCount = d.likeCount + 1 WHERE d.decisionId = :decisionId")
    void incrementLikeCount(@Param("decisionId") Long decisionId);

    @Modifying
    @Query("UPDATE Decision d SET d.shareCount = d.shareCount + 1 WHERE d.decisionId = :decisionId")
    void incrementShareCount(@Param("decisionId") Long decisionId);

    List<Decision> findByStatusAndDeadlineBefore(DecisionStatus status, LocalDateTime now);

    long countByCreatedAtAfter(LocalDateTime date);
}
