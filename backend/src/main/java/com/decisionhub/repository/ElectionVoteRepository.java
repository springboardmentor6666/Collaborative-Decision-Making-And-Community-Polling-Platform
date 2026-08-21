package com.decisionhub.repository;

import com.decisionhub.entity.ElectionVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ElectionVoteRepository extends JpaRepository<ElectionVote, Long>, JpaSpecificationExecutor<ElectionVote> {
    Optional<ElectionVote> findByUserUserIdAndVotingCategoryCategoryId(Long userId, Long categoryId);
    boolean existsByUserUserIdAndVotingCategoryCategoryId(Long userId, Long categoryId);
    List<ElectionVote> findByVotingEventEventId(Long eventId);
    List<ElectionVote> findByVotingCategoryCategoryId(Long categoryId);
    long countByNomineeNomineeId(Long nomineeId);

    @Query("SELECT v.nominee.nomineeId, COUNT(v) FROM ElectionVote v WHERE v.votingCategory.categoryId = :categoryId GROUP BY v.nominee.nomineeId")
    List<Object[]> countVotesPerNomineeByCategoryId(@Param("categoryId") Long categoryId);
}
