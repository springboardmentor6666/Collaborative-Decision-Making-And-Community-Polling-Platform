package com.decisionhub.repository;

import com.decisionhub.entity.VotingEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VotingEventRepository extends JpaRepository<VotingEvent, Long>, JpaSpecificationExecutor<VotingEvent> {
    Page<VotingEvent> findByCommunityCommunityId(Long communityId, Pageable pageable);
    List<VotingEvent> findByCommunityCommunityId(Long communityId);
}
