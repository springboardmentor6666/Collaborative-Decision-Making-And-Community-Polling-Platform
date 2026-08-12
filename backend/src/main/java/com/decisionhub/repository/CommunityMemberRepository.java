package com.decisionhub.repository;

import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.entity.CommunityMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    Optional<CommunityMember> findByCommunityCommunityIdAndUserUserId(Long communityId, Long userId);

    boolean existsByCommunityCommunityIdAndUserUserId(Long communityId, Long userId);

    boolean existsByCommunityCommunityIdAndUserUserIdAndStatus(Long communityId, Long userId, MemberStatus status);

    Page<CommunityMember> findByCommunityCommunityIdAndStatus(Long communityId, MemberStatus status, Pageable pageable);

    Page<CommunityMember> findByUserUserIdAndStatus(Long userId, MemberStatus status, Pageable pageable);

    long countByUserUserIdAndStatus(Long userId, MemberStatus status);

    long countByCommunityCommunityIdAndStatus(Long communityId, MemberStatus status);

    long countByCommunityCommunityId(Long communityId);

    boolean existsByCommunityCommunityIdAndUserUserIdAndMemberRole(Long communityId, Long userId, MemberRole memberRole);

    @Query(value = "SELECT COUNT(*) FROM community_member WHERE community_id = :communityId AND user_id = :userId", nativeQuery = true)
    long countAllByCommunityIdAndUserId(@Param("communityId") Long communityId, @Param("userId") Long userId);

    @Modifying
    @Query(value = "UPDATE community_member SET deleted = false, status = :#{#status.name()}, member_role = :#{#role.name()}, updated_at = CURRENT_TIMESTAMP WHERE community_id = :communityId AND user_id = :userId", nativeQuery = true)
    void resurrectMember(@Param("communityId") Long communityId, @Param("userId") Long userId, @Param("status") MemberStatus status, @Param("role") MemberRole role);
}
