package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndDecisionId(
            Long userId,
            Long decisionId
    );

    List<Vote> findByDecisionId(Long decisionId);

    void deleteByDecisionId(Long decisionId);

    long countByOptionId(Long optionId);
    long countByUser(User user);
    long countByDecisionId(Long decisionId);
}
