package com.decisionhub.repository;

import com.decisionhub.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByDecisionDecisionId(Long decisionId);

    List<Attachment> findByCommentCommentId(Long commentId);
}
