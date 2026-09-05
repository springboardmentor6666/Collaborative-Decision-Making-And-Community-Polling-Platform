package com.decisionhub.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PollResponse {

    private Long id;
    private Long decisionId;
    private String pollType;
    private String votingMethod;
    private Integer maxChoices;
    private Boolean allowRevoting;
    private String question;
    private Boolean isAnonymous;
    private LocalDateTime endsAt;
    private List<OptionDto> options;

    public PollResponse() {
    }

    public PollResponse(Long id, Long decisionId, String pollType, String question, Boolean isAnonymous,
                        LocalDateTime endsAt, List<OptionDto> options) {
        this.id = id;
        this.decisionId = decisionId;
        this.pollType = pollType;
        this.votingMethod = pollType;
        this.maxChoices = 1;
        this.allowRevoting = false;
        this.question = question;
        this.isAnonymous = isAnonymous;
        this.endsAt = endsAt;
        this.options = options;
    }

    public PollResponse(Long id, Long decisionId, String pollType, String votingMethod,
                        Integer maxChoices, Boolean allowRevoting, String question,
                        Boolean isAnonymous, LocalDateTime endsAt, List<OptionDto> options) {
        this.id = id;
        this.decisionId = decisionId;
        this.pollType = pollType;
        this.votingMethod = votingMethod;
        this.maxChoices = maxChoices;
        this.allowRevoting = allowRevoting;
        this.question = question;
        this.isAnonymous = isAnonymous;
        this.endsAt = endsAt;
        this.options = options;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
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

    public List<OptionDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDto> options) {
        this.options = options;
    }
}
