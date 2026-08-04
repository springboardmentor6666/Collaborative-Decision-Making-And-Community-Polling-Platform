package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.CommunityMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {
    List<CommunityMember> findByCommunityId(Long communityId);
    List<CommunityMember> findByUserId(Long userId);
    boolean existsByCommunityIdAndUserId(Long communityId, Long userId);
}
