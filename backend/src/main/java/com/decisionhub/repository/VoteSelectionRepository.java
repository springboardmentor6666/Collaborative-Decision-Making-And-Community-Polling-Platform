package com.decisionhub.repository;

import com.decisionhub.entity.VoteSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoteSelectionRepository extends JpaRepository<VoteSelection, Long> {
    long countByOptionOptionId(Long optionId);
    List<VoteSelection> findByVoteVoteId(Long voteId);
}
