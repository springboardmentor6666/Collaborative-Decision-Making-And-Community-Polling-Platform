package com.decisionhub.dto.request;

import com.decisionhub.common.enums.AbuseReason;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbuseReportRequest {

    @NotNull(message = "Reason is required")
    private AbuseReason reason;

    private String description;
}
