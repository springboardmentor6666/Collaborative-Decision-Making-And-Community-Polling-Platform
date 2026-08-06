package com.decisionhub.dto.response;

import com.decisionhub.common.enums.ReportType;
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
public class ReportResponse {

    private Long reportId;
    private Long decisionId;
    private UserResponse generatedBy;
    private ReportType reportType;
    private String reportUrl;
    private LocalDateTime generatedAt;
}
