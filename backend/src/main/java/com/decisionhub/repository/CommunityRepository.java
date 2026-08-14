package com.decisionhub.repository;

import com.decisionhub.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {

    Optional<Community> findByName(String name);

    boolean existsByName(String name);

    List<Community> findByVisibility(String visibility);

    List<Community> findByNameContainingIgnoreCase(String keyword);

    List<Community> findByVisibilityAndNameContainingIgnoreCase(String visibility, String keyword);

    @Query("SELECT c FROM Community c WHERE (c.visibility = 'PUBLIC' OR c.id IN (SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.email = :email)) AND LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Community> searchCommunitiesForUser(@Param("keyword") String keyword, @Param("email") String email);

    @Query("SELECT c FROM Community c WHERE c.visibility = 'PUBLIC' OR c.id IN (SELECT cm.community.id FROM CommunityMember cm WHERE cm.user.email = :email)")
    List<Community> findAllVisibleToUser(@Param("email") String email);
}
