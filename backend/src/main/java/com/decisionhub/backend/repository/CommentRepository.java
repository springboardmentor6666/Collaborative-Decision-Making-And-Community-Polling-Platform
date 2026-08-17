package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByDecisionIdOrderByCreatedAtAsc(Long decisionId);
}
