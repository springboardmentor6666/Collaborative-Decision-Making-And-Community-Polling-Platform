package com.decisionhub.repository;

import com.decisionhub.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByDecisionDecisionIdAndParentCommentIsNullOrderByCreatedAtDesc(Long decisionId,
            Pageable pageable);

    List<Comment> findByParentCommentCommentIdOrderByCreatedAtAsc(Long parentCommentId);

    long countByDecisionDecisionId(Long decisionId);
}
