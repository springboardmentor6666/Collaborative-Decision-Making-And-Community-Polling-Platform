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
            Long createdById) {

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

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
