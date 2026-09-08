package com.decisionhub.service;

import com.decisionhub.dto.AdminStatsOverviewDto;
import com.decisionhub.dto.AdminStatsTimeSeriesDto;
import com.decisionhub.entity.AccountStatus;
import com.decisionhub.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AdminStatisticsService {

    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final CommunityRepository communityRepository;
    private final CommentRepository commentRepository;
    private final CommunityMessageRepository communityMessageRepository;
    private final ReportRepository reportRepository;
    private final VoteRepository voteRepository;
    private final PollRepository pollRepository;

    public AdminStatisticsService(UserRepository userRepository,
                                  DecisionRepository decisionRepository,
                                  CommunityRepository communityRepository,
                                  CommentRepository commentRepository,
                                  CommunityMessageRepository communityMessageRepository,
                                  ReportRepository reportRepository,
                                  VoteRepository voteRepository,
                                  PollRepository pollRepository) {
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.communityRepository = communityRepository;
        this.commentRepository = commentRepository;
        this.communityMessageRepository = communityMessageRepository;
        this.reportRepository = reportRepository;
        this.voteRepository = voteRepository;
        this.pollRepository = pollRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsOverviewDto getOverviewStatistics() {
        AdminStatsOverviewDto dto = new AdminStatsOverviewDto();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfWeek = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime startOfMonth = LocalDate.now().minusDays(29).atStartOfDay();

        // 1. User Metrics
        dto.setTotalUsers(userRepository.count());
        dto.setActiveUsers(userRepository.countByAccountStatus(AccountStatus.ACTIVE));
        dto.setDeactivatedUsers(userRepository.countByAccountStatus(AccountStatus.DEACTIVATED));
        dto.setPendingDeletionUsers(userRepository.countByAccountStatus(AccountStatus.PENDING_DELETION));
        dto.setNewUsersToday(userRepository.countByCreatedAtGreaterThanEqual(startOfToday));
        dto.setNewUsersThisWeek(userRepository.countByCreatedAtGreaterThanEqual(startOfWeek));
        dto.setNewUsersThisMonth(userRepository.countByCreatedAtGreaterThanEqual(startOfMonth));

        // 2. Decision Metrics
        dto.setTotalDecisions(decisionRepository.countByIsDeletedFalse());
        dto.setOpenDecisions(decisionRepository.countByStatusIgnoreCaseAndIsDeletedFalse("OPEN"));
        dto.setClosedDecisions(decisionRepository.countByStatusIgnoreCaseAndIsDeletedFalse("CLOSED"));
        dto.setDecisionsCreatedToday(decisionRepository.countByCreatedAtGreaterThanEqualAndIsDeletedFalse(startOfToday));
        dto.setDecisionsCreatedThisWeek(decisionRepository.countByCreatedAtGreaterThanEqualAndIsDeletedFalse(startOfWeek));
        dto.setDecisionsCreatedThisMonth(decisionRepository.countByCreatedAtGreaterThanEqualAndIsDeletedFalse(startOfMonth));

        // 3. Community Metrics
        dto.setTotalCommunities(communityRepository.count());
        dto.setPublicCommunities(communityRepository.countByVisibilityIgnoreCase("PUBLIC"));
        dto.setPrivateCommunities(communityRepository.countByVisibilityIgnoreCase("PRIVATE"));
        dto.setCommunitiesCreatedToday(communityRepository.countByCreatedAtGreaterThanEqual(startOfToday));
        dto.setCommunitiesCreatedThisWeek(communityRepository.countByCreatedAtGreaterThanEqual(startOfWeek));
        dto.setCommunitiesCreatedThisMonth(communityRepository.countByCreatedAtGreaterThanEqual(startOfMonth));

        // 4. Engagement & Content Metrics
        dto.setTotalComments(commentRepository.count());
        dto.setCommentsCreatedToday(commentRepository.countByCreatedAtGreaterThanEqual(startOfToday));
        dto.setTotalDiscussions(communityMessageRepository.countByIsDeletedFalse());
        dto.setDiscussionsCreatedToday(communityMessageRepository.countByCreatedAtGreaterThanEqual(startOfToday));
        dto.setTotalVotes(voteRepository.count());
        dto.setTotalPolls(pollRepository.count());

        // 5. Moderation & Report Metrics
        dto.setTotalReports(reportRepository.count());
        dto.setPendingReports(reportRepository.countByStatusIgnoreCase("PENDING"));
        dto.setReviewedReports(reportRepository.countByStatusIgnoreCase("REVIEWED"));
        dto.setResolvedReports(reportRepository.countByStatusIgnoreCase("RESOLVED"));
        dto.setNoActionReports(reportRepository.countByStatusIgnoreCase("NO_ACTION"));
        dto.setTemporarilyRemovedContent(decisionRepository.countByStatusIgnoreCase("TEMPORARILY_REMOVED") + reportRepository.countByStatusIgnoreCase("TEMPORARILY_REMOVED"));
        dto.setPermanentlyRemovedContent(decisionRepository.countByIsDeletedTrue() + reportRepository.countByStatusIgnoreCase("CONTENT_REMOVED"));

        // Grouping maps
        Map<String, Long> byType = new HashMap<>();
        for (Object[] row : reportRepository.countGroupedByContentType()) {
            if (row[0] != null) {
                byType.put(row[0].toString().toUpperCase(), ((Number) row[1]).longValue());
            }
        }
        dto.setReportsByContentType(byType);

        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : reportRepository.countGroupedByStatus()) {
            if (row[0] != null) {
                byStatus.put(row[0].toString().toUpperCase(), ((Number) row[1]).longValue());
            }
        }
        dto.setReportsByStatus(byStatus);

        return dto;
    }

    @Transactional(readOnly = true)
    public AdminStatsTimeSeriesDto getTimeSeriesStatistics(String range, String customStart, String customEnd) {
        LocalDate endLocalDate = LocalDate.now();
        LocalDate startLocalDate;

        String normalizedRange = (range != null && !range.isBlank()) ? range.trim().toUpperCase() : "7D";

        switch (normalizedRange) {
            case "TODAY":
                startLocalDate = endLocalDate;
                break;
            case "30D":
            case "MONTH":
                startLocalDate = endLocalDate.minusDays(29);
                break;
            case "90D":
            case "QUARTER":
                startLocalDate = endLocalDate.minusDays(89);
                break;
            case "CUSTOM":
                if (customStart != null && !customStart.isBlank()) {
                    try {
                        startLocalDate = LocalDate.parse(customStart);
                    } catch (Exception e) {
                        startLocalDate = endLocalDate.minusDays(6);
                    }
                } else {
                    startLocalDate = endLocalDate.minusDays(6);
                }
                if (customEnd != null && !customEnd.isBlank()) {
                    try {
                        endLocalDate = LocalDate.parse(customEnd);
                    } catch (Exception e) {
                        endLocalDate = LocalDate.now();
                    }
                }
                break;
            case "7D":
            case "WEEK":
            default:
                normalizedRange = "7D";
                startLocalDate = endLocalDate.minusDays(6);
                break;
        }

        if (startLocalDate.isAfter(endLocalDate)) {
            LocalDate temp = startLocalDate;
            startLocalDate = endLocalDate;
            endLocalDate = temp;
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<AdminStatsTimeSeriesDto.DailyMetricPoint> dailyData = new ArrayList<>();

        LocalDate current = startLocalDate;
        while (!current.isAfter(endLocalDate)) {
            LocalDateTime dayStart = current.atStartOfDay();
            LocalDateTime dayEnd = current.atTime(LocalTime.MAX);
            String dateStr = current.format(dtf);

            long decisions = decisionRepository.countByCreatedAtBetweenAndIsDeletedFalse(dayStart, dayEnd);
            long communities = communityRepository.countByCreatedAtBetween(dayStart, dayEnd);
            long users = userRepository.countByCreatedAtBetween(dayStart, dayEnd);
            long comments = commentRepository.countByCreatedAtBetween(dayStart, dayEnd);
            long discussions = communityMessageRepository.countByCreatedAtBetween(dayStart, dayEnd);
            long reports = reportRepository.countByCreatedAtBetween(dayStart, dayEnd);
            long votes = voteRepository.countByVotedAtBetween(dayStart, dayEnd);

            dailyData.add(new AdminStatsTimeSeriesDto.DailyMetricPoint(
                    dateStr, decisions, communities, users, comments, discussions, reports, votes
            ));

            current = current.plusDays(1);
        }

        return new AdminStatsTimeSeriesDto(
                normalizedRange,
                startLocalDate.format(dtf),
                endLocalDate.format(dtf),
                dailyData
        );
    }
}
