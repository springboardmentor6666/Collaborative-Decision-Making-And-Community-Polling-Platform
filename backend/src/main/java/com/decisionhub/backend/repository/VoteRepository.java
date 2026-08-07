package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserIdAndDecisionId(Long userId, Long decisionId);
    long countByOptionId(Long optionId);
}
