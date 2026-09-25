package com.decisionhub.backend.repository;

import com.decisionhub.backend.entity.CommunityMemberShip;
import com.decisionhub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityMembershipRepository
        extends JpaRepository<CommunityMemberShip, Long> {

    List<CommunityMemberShip> findByUser(User user);
    void deleteByUserId(Long userId);
    void deleteByCommunityId(Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(cm) > 0 FROM CommunityMemberShip cm WHERE cm.user.id = :userId AND cm.community.id = :communityId AND cm.leftAt IS NULL")
    boolean existsActiveByUserIdAndCommunityId(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("communityId") Long communityId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(cm) FROM CommunityMemberShip cm WHERE cm.user.id = :userId AND cm.leftAt IS NULL")
    long countActiveByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
