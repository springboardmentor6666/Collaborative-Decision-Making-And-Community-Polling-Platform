package com.decisionhub.dto;

import java.util.Map;

public class RankingRoundDto {

    private int roundNumber;
    private Map<Long, Long> candidateVotes;
    private Map<Long, Double> candidatePercentages;
    private Long eliminatedOptionId;
    private String eliminatedOptionLabel;
    private boolean winnerFound;
    private Long winnerOptionId;
    private String winnerOptionLabel;

    public RankingRoundDto() {
    }

    public RankingRoundDto(int roundNumber, Map<Long, Long> candidateVotes,
                           Map<Long, Double> candidatePercentages,
                           Long eliminatedOptionId, String eliminatedOptionLabel,
                           boolean winnerFound, Long winnerOptionId, String winnerOptionLabel) {
        this.roundNumber = roundNumber;
        this.candidateVotes = candidateVotes;
        this.candidatePercentages = candidatePercentages;
        this.eliminatedOptionId = eliminatedOptionId;
        this.eliminatedOptionLabel = eliminatedOptionLabel;
        this.winnerFound = winnerFound;
        this.winnerOptionId = winnerOptionId;
        this.winnerOptionLabel = winnerOptionLabel;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    public Map<Long, Long> getCandidateVotes() {
        return candidateVotes;
    }

    public void setCandidateVotes(Map<Long, Long> candidateVotes) {
        this.candidateVotes = candidateVotes;
    }

    public Map<Long, Double> getCandidatePercentages() {
        return candidatePercentages;
    }

    public void setCandidatePercentages(Map<Long, Double> candidatePercentages) {
        this.candidatePercentages = candidatePercentages;
    }

    public Long getEliminatedOptionId() {
        return eliminatedOptionId;
    }

    public void setEliminatedOptionId(Long eliminatedOptionId) {
        this.eliminatedOptionId = eliminatedOptionId;
    }

    public String getEliminatedOptionLabel() {
        return eliminatedOptionLabel;
    }

    public void setEliminatedOptionLabel(String eliminatedOptionLabel) {
        this.eliminatedOptionLabel = eliminatedOptionLabel;
    }

    public boolean isWinnerFound() {
        return winnerFound;
    }

    public void setWinnerFound(boolean winnerFound) {
        this.winnerFound = winnerFound;
    }

    public Long getWinnerOptionId() {
        return winnerOptionId;
    }

    public void setWinnerOptionId(Long winnerOptionId) {
        this.winnerOptionId = winnerOptionId;
    }

    public String getWinnerOptionLabel() {
        return winnerOptionLabel;
    }

    public void setWinnerOptionLabel(String winnerOptionLabel) {
        this.winnerOptionLabel = winnerOptionLabel;
    }
}
