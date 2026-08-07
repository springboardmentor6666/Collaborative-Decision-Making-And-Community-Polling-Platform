package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByDecisionIdOrderByCreatedAtDesc(Long decisionId);
}
