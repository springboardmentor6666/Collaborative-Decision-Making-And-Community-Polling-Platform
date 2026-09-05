package com.decisionhub.repository;

import com.decisionhub.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByDecisionId(Long decisionId);
    List<Comment> findByDecisionIdAndParentIsNull(Long decisionId);
    List<Comment> findByDecisionIdAndParentIsNull(Long decisionId, Sort sort);
    List<Comment> findByAuthorId(Long authorId);
    List<Comment> findByParentId(Long parentId);
    List<Comment> findByParentId(Long parentId, Sort sort);

    @Query("SELECT c FROM Comment c WHERE c.decision.isDeleted = false " +
           "AND (c.decision.visibility = 'PUBLIC' OR (c.decision.owner.email = :email) OR (c.decision.community.id IN (SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.email = :email))) " +
           "AND LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Comment> searchCommentsPaged(@Param("query") String query, @Param("email") String email, Pageable pageable);
}
