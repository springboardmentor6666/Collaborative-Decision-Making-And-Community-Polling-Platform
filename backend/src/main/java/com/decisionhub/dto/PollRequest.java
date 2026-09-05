package com.decisionhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class PollRequest {

    @NotNull(message = "Decision ID is required")
    private Long decisionId;

    private String pollType = "SINGLE";

    private String votingMethod = "SINGLE_CHOICE";

    private Integer maxChoices = 1;

    private Boolean allowRevoting = false;

    private Boolean isAnonymous = false;

    private LocalDateTime endsAt;

    @NotEmpty(message = "At least two option labels are required")
    private List<String> optionLabels;

    public PollRequest() {
    }

    public PollRequest(Long decisionId, String pollType, Boolean isAnonymous, List<String> optionLabels) {
        this.decisionId = decisionId;
        this.pollType = pollType;
        this.isAnonymous = isAnonymous;
        this.optionLabels = optionLabels;
    }

    public PollRequest(Long decisionId, String pollType, String votingMethod, Integer maxChoices,
                       Boolean allowRevoting, Boolean isAnonymous, LocalDateTime endsAt, List<String> optionLabels) {
        this.decisionId = decisionId;
        this.pollType = pollType;
        this.votingMethod = votingMethod != null ? votingMethod : pollType;
        this.maxChoices = maxChoices != null ? maxChoices : 1;
        this.allowRevoting = allowRevoting != null ? allowRevoting : false;
        this.isAnonymous = isAnonymous;
        this.endsAt = endsAt;
        this.optionLabels = optionLabels;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public String getPollType() {
        return pollType;
    }

    public void setPollType(String pollType) {
        this.pollType = pollType;
    }

    public String getVotingMethod() {
        return votingMethod;
    }

    public void setVotingMethod(String votingMethod) {
        this.votingMethod = votingMethod;
    }

    public Integer getMaxChoices() {
        return maxChoices;
    }

    public void setMaxChoices(Integer maxChoices) {
        this.maxChoices = maxChoices;
    }

    public Boolean getAllowRevoting() {
        return allowRevoting;
    }

    public void setAllowRevoting(Boolean allowRevoting) {
        this.allowRevoting = allowRevoting;
    }

    public Boolean getIsAnonymous() {
        return isAnonymous;
    }

    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }

    public List<String> getOptionLabels() {
        return optionLabels;
    }

    public void setOptionLabels(List<String> optionLabels) {
        this.optionLabels = optionLabels;
    }
}
