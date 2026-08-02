package com.decisionhub.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized API Error Payload structure returned on exception occurrences.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiErrorResponse {

    @Builder.Default
    private boolean success = false;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> validationErrors;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
