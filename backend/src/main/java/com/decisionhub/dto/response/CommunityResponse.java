package com.decisionhub.dto.response;

import com.decisionhub.common.enums.CommunityVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityResponse {

    private Long communityId;
    private String name;
    private String description;
    private UserResponse owner;

    private CommunityVisibility visibility;
    private String image;
    private long memberCount;
    private LocalDateTime createdAt;
}
