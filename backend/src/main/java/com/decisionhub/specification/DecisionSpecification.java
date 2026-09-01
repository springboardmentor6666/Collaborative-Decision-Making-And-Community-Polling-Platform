package com.decisionhub.specification;

import com.decisionhub.common.enums.DecisionStatus;
import com.decisionhub.common.enums.DecisionVisibility;
import com.decisionhub.common.enums.VoteType;
import com.decisionhub.entity.Decision;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

import com.decisionhub.common.enums.CommunityVisibility;
import com.decisionhub.common.enums.MemberStatus;
import com.decisionhub.entity.CommunityMember;
import jakarta.persistence.criteria.Subquery;
import jakarta.persistence.criteria.Root;

/**
 * JPA Dynamic Specification Builder for searching and filtering Decision entities.
 */
public class DecisionSpecification {

    public static Specification<Decision> filterDecisions(
            String searchQuery,
            Long communityId,
            DecisionVisibility visibility,
            DecisionStatus status,
            VoteType voteType,
            Long createdById,
            Long requestingUserId) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(searchQuery)) {
                String likePattern = "%" + searchQuery.toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern);
                Predicate descPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern);
                predicates.add(criteriaBuilder.or(titlePredicate, descPredicate));
            }

            if (communityId != null) {
                predicates.add(criteriaBuilder.equal(root.get("community").get("communityId"), communityId));
            }

            if (visibility != null) {
                predicates.add(criteriaBuilder.equal(root.get("visibility"), visibility));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (voteType != null) {
                predicates.add(criteriaBuilder.equal(root.get("voteType"), voteType));
            }

            if (createdById != null) {
                predicates.add(criteriaBuilder.equal(root.get("createdBy").get("userId"), createdById));
            }

            // Privacy logic
            jakarta.persistence.criteria.Join<Object, Object> communityJoin = root.join("community", jakarta.persistence.criteria.JoinType.LEFT);
            Predicate isPublicDecision = criteriaBuilder.or(
                    criteriaBuilder.equal(root.get("visibility"), DecisionVisibility.PUBLIC),
                    criteriaBuilder.isNull(root.get("visibility"))
            );
            Predicate isPublicCommunity = criteriaBuilder.or(
                    criteriaBuilder.isNull(root.get("community")),
                    criteriaBuilder.equal(communityJoin.get("visibility"), CommunityVisibility.PUBLIC),
                    criteriaBuilder.isNull(communityJoin.get("visibility"))
            );
            Predicate publicAccess = criteriaBuilder.and(isPublicDecision, isPublicCommunity);

            Predicate accessPredicate = publicAccess;

            if (requestingUserId != null) {
                Predicate isAuthor = criteriaBuilder.equal(root.get("createdBy").get("userId"), requestingUserId);
                
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<CommunityMember> cmRoot = subquery.from(CommunityMember.class);
                subquery.select(cmRoot.get("community").get("communityId"));
                subquery.where(
                        criteriaBuilder.equal(cmRoot.get("community"), communityJoin),
                        criteriaBuilder.equal(cmRoot.get("user").get("userId"), requestingUserId),
                        criteriaBuilder.equal(cmRoot.get("status"), MemberStatus.ACTIVE)
                );
                Predicate isMember = criteriaBuilder.exists(subquery);
                Predicate isCommunityDecision = criteriaBuilder.isNotNull(root.get("community"));
                Predicate memberAccess = criteriaBuilder.and(isCommunityDecision, isMember);

                accessPredicate = criteriaBuilder.or(publicAccess, isAuthor, memberAccess);
            }

            predicates.add(accessPredicate);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
