package com.decisionhub.repository;

import com.decisionhub.entity.CommunityInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommunityInviteRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'CommunityInvite' entities.
 */
@Repository
public interface CommunityInviteRepository extends JpaRepository<CommunityInvite, Long> {
    List<CommunityInvite> findByInviteeIdAndStatus(Long inviteeId, String status);
    Optional<CommunityInvite> findByCommunityIdAndInviteeIdAndStatus(Long communityId, Long inviteeId, String status);
    boolean existsByCommunityIdAndInviteeIdAndStatus(Long communityId, Long inviteeId, String status);
}
