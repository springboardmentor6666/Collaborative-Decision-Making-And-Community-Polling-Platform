package com.decisionhub.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ReportRequest {
    @NotBlank
    private String reportType; // DECISION_REPORT, POLL_RESULTS, VOTING_ANALYTICS, COMMUNITY_REPORT

    private String fileFormat = "PDF"; // PDF, EXCEL, CSV

    private Long decisionId;
    private Long communityId;

    public ReportRequest() {
    }

    public ReportRequest(String reportType, String fileFormat, Long decisionId, Long communityId) {
        this.reportType = reportType;
        this.fileFormat = fileFormat;
        this.decisionId = decisionId;
        this.communityId = communityId;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getFileFormat() {
        return fileFormat;
    }

    public void setFileFormat(String fileFormat) {
        this.fileFormat = fileFormat;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public Long getCommunityId() {
        return communityId;
    }

    public void setCommunityId(Long communityId) {
        this.communityId = communityId;
    }
}
