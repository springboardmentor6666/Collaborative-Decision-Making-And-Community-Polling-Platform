package com.decisionhub.repository;

import com.decisionhub.entity.SavedDecision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedDecisionRepository extends JpaRepository<SavedDecision, Long> {

    Page<SavedDecision> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<SavedDecision> findByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    boolean existsByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    void deleteByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);
}
