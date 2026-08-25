package com.decisionhub.repository;

import com.decisionhub.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByDecisionId(Long decisionId);
    List<Attachment> findByCommentId(Long commentId);
    List<Attachment> findByUploadedById(Long userId);
}
