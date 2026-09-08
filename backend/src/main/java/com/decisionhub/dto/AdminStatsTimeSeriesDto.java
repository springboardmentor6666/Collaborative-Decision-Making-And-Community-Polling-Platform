package com.decisionhub.dto;

import java.util.List;

public class AdminStatsTimeSeriesDto {

    private String range; // TODAY, 7D, 30D, 90D, CUSTOM
    private String startDate;
    private String endDate;
    private List<DailyMetricPoint> dailyData;

    public static class DailyMetricPoint {
        private String date; // YYYY-MM-DD
        private long decisionsCount;
        private long communitiesCount;
        private long usersCount;
        private long commentsCount;
        private long discussionsCount;
        private long reportsCount;
        private long votesCount;

        public DailyMetricPoint() {
        }

        public DailyMetricPoint(String date, long decisionsCount, long communitiesCount, long usersCount,
                                long commentsCount, long discussionsCount, long reportsCount, long votesCount) {
            this.date = date;
            this.decisionsCount = decisionsCount;
            this.communitiesCount = communitiesCount;
            this.usersCount = usersCount;
            this.commentsCount = commentsCount;
            this.discussionsCount = discussionsCount;
            this.reportsCount = reportsCount;
            this.votesCount = votesCount;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public long getDecisionsCount() {
            return decisionsCount;
        }

        public void setDecisionsCount(long decisionsCount) {
            this.decisionsCount = decisionsCount;
        }

        public long getCommunitiesCount() {
            return communitiesCount;
        }

        public void setCommunitiesCount(long communitiesCount) {
            this.communitiesCount = communitiesCount;
        }

        public long getUsersCount() {
            return usersCount;
        }

        public void setUsersCount(long usersCount) {
            this.usersCount = usersCount;
        }

        public long getCommentsCount() {
            return commentsCount;
        }

        public void setCommentsCount(long commentsCount) {
            this.commentsCount = commentsCount;
        }

        public long getDiscussionsCount() {
            return discussionsCount;
        }

        public void setDiscussionsCount(long discussionsCount) {
            this.discussionsCount = discussionsCount;
        }

        public long getReportsCount() {
            return reportsCount;
        }

        public void setReportsCount(long reportsCount) {
            this.reportsCount = reportsCount;
        }

        public long getVotesCount() {
            return votesCount;
        }

        public void setVotesCount(long votesCount) {
            this.votesCount = votesCount;
        }
    }

    public AdminStatsTimeSeriesDto() {
    }

    public AdminStatsTimeSeriesDto(String range, String startDate, String endDate, List<DailyMetricPoint> dailyData) {
        this.range = range;
        this.startDate = startDate;
        this.endDate = endDate;
        this.dailyData = dailyData;
    }

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public List<DailyMetricPoint> getDailyData() {
        return dailyData;
    }

    public void setDailyData(List<DailyMetricPoint> dailyData) {
        this.dailyData = dailyData;
    }
}
