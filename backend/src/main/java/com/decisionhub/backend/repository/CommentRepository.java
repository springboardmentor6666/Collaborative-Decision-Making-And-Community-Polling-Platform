package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Comment;
import com.decisionhub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByDecisionIdOrderByCreatedAtAsc(Long decisionId);
    void deleteByDecisionId(Long decisionId);
    List<Comment> findByUser(User user);
}
