package com.decisionhub.dto;

import java.util.List;

public class VoteResultResponse {

    private Long pollId;
    private Long decisionId;
    private String decisionTitle;
    private String pollType;
    private String votingMethod;
    private Integer totalVotes;
    private Long winningOptionId;
    private String winningOption;
    private Integer winningVoteCount;
    private List<OptionDto> options;
    private List<RankingRoundDto> roundsBreakdown;

    public VoteResultResponse() {
    }

    public VoteResultResponse(Long pollId, Long decisionId, String decisionTitle, String pollType,
                              Integer totalVotes, String winningOption, Integer winningVoteCount,
                              List<OptionDto> options) {
        this.pollId = pollId;
        this.decisionId = decisionId;
        this.decisionTitle = decisionTitle;
        this.pollType = pollType;
        this.votingMethod = pollType;
        this.totalVotes = totalVotes;
        this.winningOption = winningOption;
        this.winningVoteCount = winningVoteCount;
        this.options = options;
    }

    public VoteResultResponse(Long pollId, Long decisionId, String decisionTitle, String pollType,
                              String votingMethod, Integer totalVotes, Long winningOptionId,
                              String winningOption, Integer winningVoteCount,
                              List<OptionDto> options, List<RankingRoundDto> roundsBreakdown) {
        this.pollId = pollId;
        this.decisionId = decisionId;
        this.decisionTitle = decisionTitle;
        this.pollType = pollType;
        this.votingMethod = votingMethod;
        this.totalVotes = totalVotes;
        this.winningOptionId = winningOptionId;
        this.winningOption = winningOption;
        this.winningVoteCount = winningVoteCount;
        this.options = options;
        this.roundsBreakdown = roundsBreakdown;
    }

    public Long getPollId() {
        return pollId;
    }

    public void setPollId(Long pollId) {
        this.pollId = pollId;
    }

    public Long getDecisionId() {
        return decisionId;
    }

    public void setDecisionId(Long decisionId) {
        this.decisionId = decisionId;
    }

    public String getDecisionTitle() {
        return decisionTitle;
    }

    public void setDecisionTitle(String decisionTitle) {
        this.decisionTitle = decisionTitle;
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

    public Integer getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(Integer totalVotes) {
        this.totalVotes = totalVotes;
    }

    public Long getWinningOptionId() {
        return winningOptionId;
    }

    public void setWinningOptionId(Long winningOptionId) {
        this.winningOptionId = winningOptionId;
    }

    public String getWinningOption() {
        return winningOption;
    }

    public void setWinningOption(String winningOption) {
        this.winningOption = winningOption;
    }

    public Integer getWinningVoteCount() {
        return winningVoteCount;
    }

    public void setWinningVoteCount(Integer winningVoteCount) {
        this.winningVoteCount = winningVoteCount;
    }

    public List<OptionDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDto> options) {
        this.options = options;
    }

    public List<RankingRoundDto> getRoundsBreakdown() {
        return roundsBreakdown;
    }

    public void setRoundsBreakdown(List<RankingRoundDto> roundsBreakdown) {
        this.roundsBreakdown = roundsBreakdown;
    }
}
