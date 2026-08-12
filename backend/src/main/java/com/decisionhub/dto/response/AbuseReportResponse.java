package com.decisionhub.dto.response;

import com.decisionhub.common.enums.AbuseReason;
import com.decisionhub.common.enums.AbuseReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbuseReportResponse {
    private Long reportId;
    private Long decisionId;
    private String decisionTitle;
    private Long communityId;
    private String communityName;
    private UserResponse reportedBy;
    private AbuseReason reason;
    private String description;
    private AbuseReportStatus status;
    private UserResponse resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
