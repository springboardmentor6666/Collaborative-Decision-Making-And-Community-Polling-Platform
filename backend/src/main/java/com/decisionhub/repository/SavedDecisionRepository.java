package com.decisionhub.repository;

import com.decisionhub.entity.SavedDecision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SavedDecisionRepository extends JpaRepository<SavedDecision, Long> {

    Page<SavedDecision> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<SavedDecision> findByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    boolean existsByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    long countByUserUserId(Long userId);

    void deleteByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);
}
