package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserIdAndDecisionId(Long userId, Long decisionId);
    List<Vote> findByDecisionId(Long decisionId);
    long countByOptionId(Long optionId);
    long countByDecisionId(Long decisionId);
    long countByUserId(Long userId);
}
