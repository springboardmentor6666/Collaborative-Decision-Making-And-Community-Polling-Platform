package com.decisionhub.repository;

import com.decisionhub.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    boolean existsByPollIdAndVoterId(Long pollId, Long voterId);
    boolean existsByPollOptionIdAndVoterId(Long pollOptionId, Long voterId);
    List<Vote> findByPollIdAndVoterId(Long pollId, Long voterId);
    void deleteByPollIdAndVoterId(Long pollId, Long voterId);
    List<Vote> findByPollId(Long pollId);
    long countByPollId(Long pollId);
    List<Vote> findByVoterId(Long voterId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Vote v SET v.voter = null WHERE v.voter.id = :userId")
    void detachUserVotes(@org.springframework.data.repository.query.Param("userId") Long userId);
}
