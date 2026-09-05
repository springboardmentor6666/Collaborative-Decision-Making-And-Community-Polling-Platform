package com.decisionhub.repository;

import com.decisionhub.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    Page<Activity> findByVisibilityOrderByCreatedAtDesc(String visibility, Pageable pageable);

    Page<Activity> findByVisibilityAndActivityTypeInOrderByCreatedAtDesc(String visibility, Collection<String> activityTypes, Pageable pageable);

    Page<Activity> findByCommunityIdAndVisibilityOrderByCreatedAtDesc(Long communityId, String visibility, Pageable pageable);

    Page<Activity> findByCommunityIdOrderByCreatedAtDesc(Long communityId, Pageable pageable);

    Page<Activity> findByCommunityIdAndActivityTypeInOrderByCreatedAtDesc(Long communityId, Collection<String> activityTypes, Pageable pageable);

    Page<Activity> findByActorIdAndVisibilityOrderByCreatedAtDesc(Long actorId, String visibility, Pageable pageable);

    Page<Activity> findByActorIdOrderByCreatedAtDesc(Long actorId, Pageable pageable);

    Page<Activity> findByActorIdAndActivityTypeInOrderByCreatedAtDesc(Long actorId, Collection<String> activityTypes, Pageable pageable);

    Page<Activity> findByActorIdAndVisibilityAndActivityTypeInOrderByCreatedAtDesc(Long actorId, String visibility, Collection<String> activityTypes, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.visibility = 'PUBLIC' OR (a.community.id IN :communityIds) ORDER BY a.createdAt DESC")
    Page<Activity> findGlobalForUserWithCommunities(@Param("communityIds") Collection<Long> communityIds, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE (a.visibility = 'PUBLIC' OR (a.community.id IN :communityIds)) AND a.activityType IN :activityTypes ORDER BY a.createdAt DESC")
    Page<Activity> findGlobalForUserWithCommunitiesAndTypes(@Param("communityIds") Collection<Long> communityIds, @Param("activityTypes") Collection<String> activityTypes, Pageable pageable);
}
