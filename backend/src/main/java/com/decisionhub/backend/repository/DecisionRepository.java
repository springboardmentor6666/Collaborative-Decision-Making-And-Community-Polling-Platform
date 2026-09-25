package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DecisionRepository
        extends JpaRepository<Decision, Long> {

    List<Decision> findByCreatedBy(User user);
    List<Decision> findByCreatedById(Long userId);
    List<Decision> findByCommunityId(Long communityId);
    long countByCreatedBy(User user);
    long countByDeadlineBefore(java.time.LocalDate date);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Decision d LEFT JOIN FETCH d.createdBy LEFT JOIN FETCH d.community WHERE d.community IS NULL AND UPPER(d.visibility) = 'PUBLIC' AND (d.deadline IS NULL OR d.deadline >= :now)")
    List<Decision> findActivePublicDecisions(@org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Decision d LEFT JOIN FETCH d.createdBy LEFT JOIN FETCH d.community WHERE d.createdBy.id = :userId")
    List<Decision> findByCreatedByIdWithAssociations(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Decision d LEFT JOIN FETCH d.createdBy LEFT JOIN FETCH d.community WHERE d.community.id = :communityId")
    List<Decision> findByCommunityIdWithAssociations(@org.springframework.data.repository.query.Param("communityId") Long communityId);

    void deleteByCreatedById(Long userId);
}
