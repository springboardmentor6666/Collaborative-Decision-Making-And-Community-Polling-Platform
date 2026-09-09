package com.decisionhub.repository;

import com.decisionhub.entity.CommunityChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommunityChatChannelRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'CommunityChatChannel' entities.
 */
@Repository
public interface CommunityChatChannelRepository extends JpaRepository<CommunityChatChannel, Long> {

    List<CommunityChatChannel> findByCommunityId(Long communityId);

    Optional<CommunityChatChannel> findByCommunityIdAndIsDefaultTrue(Long communityId);

    Optional<CommunityChatChannel> findByCommunityIdAndName(Long communityId, String name);

    boolean existsByCommunityIdAndName(Long communityId, String name);
}
