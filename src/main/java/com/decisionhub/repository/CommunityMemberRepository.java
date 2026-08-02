package com.decisionhub.repository;

import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.entity.CommunityMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    Optional<CommunityMember> findByCommunityCommunityIdAndUserUserId(Long communityId, Long userId);

    boolean existsByCommunityCommunityIdAndUserUserId(Long communityId, Long userId);

    boolean existsByCommunityCommunityIdAndUserUserIdAndStatus(Long communityId, Long userId, MemberStatus status);

    Page<CommunityMember> findByCommunityCommunityIdAndStatus(Long communityId, MemberStatus status, Pageable pageable);

    Page<CommunityMember> findByUserUserIdAndStatus(Long userId, MemberStatus status, Pageable pageable);

    long countByCommunityCommunityIdAndStatus(Long communityId, MemberStatus status);

    boolean existsByCommunityCommunityIdAndUserUserIdAndMemberRole(Long communityId, Long userId, MemberRole memberRole);
}
