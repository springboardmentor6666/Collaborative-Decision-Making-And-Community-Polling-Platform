package com.decisionhub.repository;

import com.decisionhub.entity.VoteSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteSelectionRepository extends JpaRepository<VoteSelection, Long> {
    long countByOptionOptionId(Long optionId);
    List<VoteSelection> findByVoteVoteId(Long voteId);
}
