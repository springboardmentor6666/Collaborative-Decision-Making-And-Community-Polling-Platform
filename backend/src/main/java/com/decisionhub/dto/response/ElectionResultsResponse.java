package com.decisionhub.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ElectionResultsResponse {
    private Long eventId;
    private String title;
    private long totalEligibleMembers;
    private long totalVotes;
    private double participationRate;
    private List<CategoryResultResponse> categories;

    @Data
    @Builder
    public static class CategoryResultResponse {
        private Long categoryId;
        private String categoryName;
        private long totalVotes;
        private String winnerStatus; // e.g., "WINNER", "TIE"
        private List<NomineeResultResponse> winners;
        private List<NomineeResultResponse> nominees;
    }

    @Data
    @Builder
    public static class NomineeResultResponse {
        private Long nomineeId;
        private String name;
        private long votes;
        private double percentage;
    }
}
