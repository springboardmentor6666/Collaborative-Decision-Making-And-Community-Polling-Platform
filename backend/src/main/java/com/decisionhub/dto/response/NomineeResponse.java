package com.decisionhub.dto.response;

import com.decisionhub.common.enums.NominationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NomineeResponse {
    private Long nomineeId;
    private Long categoryId;
    private String name;
    private String description;
    private String imageUrl;
    private String externalUrl;
    private NominationStatus nominationStatus;
    private LocalDateTime createdAt;
    private Long submittedById;
    private String submittedByName;
}
