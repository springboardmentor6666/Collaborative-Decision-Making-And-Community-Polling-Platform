package com.decisionhub.specification;

import com.decisionhub.common.enums.CommunityVisibility;
import com.decisionhub.entity.Community;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Dynamic Specification Builder for searching and filtering Community entities.
 */
public class CommunitySpecification {

    public static Specification<Community> filterCommunities(
            String searchQuery,
            CommunityVisibility visibility,
            Long ownerId) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(searchQuery)) {
                String likePattern = "%" + searchQuery.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate descPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern);
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }

            if (visibility != null) {
                predicates.add(criteriaBuilder.equal(root.get("visibility"), visibility));
            }

            if (ownerId != null) {
                predicates.add(criteriaBuilder.equal(root.get("owner").get("userId"), ownerId));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
