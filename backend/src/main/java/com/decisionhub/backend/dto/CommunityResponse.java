package com.decisionhub.backend.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityResponse {

    private Long id;

    private String communityName;

    private String description;
    private String ownerName;
    private LocalDateTime createdAt;
    private long memberCount;
    private boolean joined;
    private List<String> memberNames;
}
