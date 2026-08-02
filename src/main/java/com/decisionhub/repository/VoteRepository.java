package com.decisionhub.repository;

import com.decisionhub.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    List<Vote> findByDecisionDecisionId(Long decisionId);

    List<Vote> findByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    Optional<Vote> findByUserUserIdAndOptionOptionId(Long userId, Long optionId);

    boolean existsByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);

    boolean existsByUserUserIdAndOptionOptionId(Long userId, Long optionId);

    long countByDecisionDecisionId(Long decisionId);

    long countByOptionOptionId(Long optionId);

    @Query("SELECT v.option.optionId, COUNT(v) FROM Vote v WHERE v.decision.decisionId = :decisionId GROUP BY v.option.optionId")
    List<Object[]> getVoteCountsByDecisionGroupedByOption(@Param("decisionId") Long decisionId);

    void deleteByUserUserIdAndDecisionDecisionId(Long userId, Long decisionId);
}
