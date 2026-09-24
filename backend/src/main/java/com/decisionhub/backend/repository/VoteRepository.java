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
    List<Vote> findByUser(User user);

    void deleteByDecisionId(Long decisionId);
    void deleteByUserId(Long userId);
    void deleteByDecisionIdIn(List<Long> decisionIds);

    long countByOptionId(Long optionId);
    long countByUser(User user);
    long countByDecisionId(Long decisionId);

    @org.springframework.data.jpa.repository.Query("SELECT v.option.id, COUNT(v) FROM Vote v WHERE v.decision.id = :decisionId GROUP BY v.option.id")
    List<Object[]> countVotesByOptionIdForDecision(@org.springframework.data.repository.query.Param("decisionId") Long decisionId);

    @org.springframework.data.jpa.repository.Query("SELECT v.option.id FROM Vote v WHERE v.user.id = :userId AND v.decision.id = :decisionId")
    Optional<Long> findVotedOptionIdByUserIdAndDecisionId(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("decisionId") Long decisionId);

    List<Vote> findByDecisionIdIn(List<Long> decisionIds);
}
