package com.decisionhub.repository;

import com.decisionhub.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: VoteRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'Vote' entities.
 */
@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    boolean existsByPollIdAndVoterId(Long pollId, Long voterId);
    boolean existsByPollOptionIdAndVoterId(Long pollOptionId, Long voterId);
    List<Vote> findByPollIdAndVoterId(Long pollId, Long voterId);
    void deleteByPollIdAndVoterId(Long pollId, Long voterId);
    void deleteByPollOptionId(Long pollOptionId);
    List<Vote> findByPollId(Long pollId);
    long countByPollId(Long pollId);
    List<Vote> findByVoterId(Long voterId);

    long countByVotedAtGreaterThanEqual(LocalDateTime date);
    long countByVotedAtBetween(LocalDateTime start, LocalDateTime end);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Vote v SET v.voter = null WHERE v.voter.id = :userId")
    void detachUserVotes(@org.springframework.data.repository.query.Param("userId") Long userId);
}
