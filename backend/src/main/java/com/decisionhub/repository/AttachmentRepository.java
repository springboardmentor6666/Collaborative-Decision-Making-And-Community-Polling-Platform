package com.decisionhub.repository;

import com.decisionhub.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: AttachmentRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'Attachment' entities.
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByDecisionId(Long decisionId);
    List<Attachment> findByCommentId(Long commentId);
    List<Attachment> findByUploadedById(Long userId);
}
