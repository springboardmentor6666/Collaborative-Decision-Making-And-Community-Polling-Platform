package com.decisionhub.dto;

import java.util.List;

public class MyVoteAnalysisDto {

    private Long decisionId;
    private String decisionTitle;
    private String status;
    private String pollQuestion;
    private long totalVotes;
    private UserChoiceDto userChoice;
    private WinningChoiceDto winningChoice;
    private boolean isWinning;
    private List<OptionBreakdownDto> optionsBreakdown;

    public MyVoteAnalysisDto() {
    }

    public MyVoteAnalysisDto(Long decisionId, String decisionTitle, String status, String pollQuestion,
                             long totalVotes, UserChoiceDto userChoice, WinningChoiceDto winningChoice,
                             boolean isWinning, List<OptionBreakdownDto> optionsBreakdown) {
        this.decisionId = decisionId;
        this.decisionTitle = decisionTitle;
        this.status = status;
        this.pollQuestion = pollQuestion;
        this.totalVotes = totalVotes;
        this.userChoice = userChoice;
        this.winningChoice = winningChoice;
        this.isWinning = isWinning;
        this.optionsBreakdown = optionsBreakdown;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPollQuestion() {
        return pollQuestion;
    }

    public void setPollQuestion(String pollQuestion) {
        this.pollQuestion = pollQuestion;
    }

    public long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public UserChoiceDto getUserChoice() {
        return userChoice;
    }

    public void setUserChoice(UserChoiceDto userChoice) {
        this.userChoice = userChoice;
    }

    public WinningChoiceDto getWinningChoice() {
        return winningChoice;
    }

    public void setWinningChoice(WinningChoiceDto winningChoice) {
        this.winningChoice = winningChoice;
    }

    public boolean isIsWinning() {
        return isWinning;
    }

    public boolean getIsWinning() {
        return isWinning;
    }

    public void setIsWinning(boolean isWinning) {
        this.isWinning = isWinning;
    }

    public List<OptionBreakdownDto> getOptionsBreakdown() {
        return optionsBreakdown;
    }

    public void setOptionsBreakdown(List<OptionBreakdownDto> optionsBreakdown) {
        this.optionsBreakdown = optionsBreakdown;
    }
}
