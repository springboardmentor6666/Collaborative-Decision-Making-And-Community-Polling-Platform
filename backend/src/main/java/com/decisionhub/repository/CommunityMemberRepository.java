package com.decisionhub.repository;

import com.decisionhub.entity.CommunityMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * Class: CommunityMemberRepository
 * Architecture Tier: Data Access Repository (Persistence Tier)
 * Package: com.decisionhub.repository
 *
 * Purpose:
 *   Spring Data JPA repository providing query methods and database persistence operations for 'CommunityMember' entities.
 */
@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    List<CommunityMember> findByCommunityId(Long communityId);

    List<CommunityMember> findByUserId(Long userId);

    Optional<CommunityMember> findByCommunityIdAndUserId(Long communityId, Long userId);

    boolean existsByCommunityIdAndUserId(Long communityId, Long userId);

    long countByCommunityId(Long communityId);

    long countByCommunityIdAndRole(Long communityId, String role);

    void deleteByCommunityIdAndUserId(Long communityId, Long userId);
    void deleteByUserId(Long userId);
}
