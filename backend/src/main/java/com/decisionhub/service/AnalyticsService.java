package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final VoteRepository voteRepository;
    private final DecisionImpressionRepository decisionImpressionRepository;
    private final ComparisonFactorRepository comparisonFactorRepository;
    private final OptionScoreRepository optionScoreRepository;

    private final CategoryRepository categoryRepository;
    private final CommunityRepository communityRepository;
    private final GeneratedReportRepository generatedReportRepository;

    public AnalyticsService(UserRepository userRepository,
                            DecisionRepository decisionRepository,
                            PollRepository pollRepository,
                            PollOptionRepository pollOptionRepository,
                            VoteRepository voteRepository,
                            DecisionImpressionRepository decisionImpressionRepository,
                            CategoryRepository categoryRepository,
                            CommunityRepository communityRepository,
                            GeneratedReportRepository generatedReportRepository,
                            ComparisonFactorRepository comparisonFactorRepository,
                            OptionScoreRepository optionScoreRepository) {
        this.userRepository = userRepository;
        this.decisionRepository = decisionRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.voteRepository = voteRepository;
        this.decisionImpressionRepository = decisionImpressionRepository;
        this.categoryRepository = categoryRepository;
        this.communityRepository = communityRepository;
        this.generatedReportRepository = generatedReportRepository;
        this.comparisonFactorRepository = comparisonFactorRepository;
        this.optionScoreRepository = optionScoreRepository;
    }

    @Transactional(readOnly = true)
    public List<MyVoteAnalysisDto> getMyVotesAnalysis(String userEmail) {
        User voter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        List<Vote> userVotes = voteRepository.findByVoterId(voter.getId());
        List<MyVoteAnalysisDto> result = new ArrayList<>();

        for (Vote userVote : userVotes) {
            Poll poll = userVote.getPoll();
            if (poll == null) {
                continue;
            }

            Decision decision = poll.getDecision();
            Long decisionId = decision != null ? decision.getId() : null;
            String decisionTitle = decision != null ? decision.getTitle() : "N/A";
            String status = decision != null ? decision.getStatus() : "OPEN";
            String pollQuestion = decision != null ? decision.getTitle() : "N/A";

            List<Vote> allPollVotes = voteRepository.findByPollId(poll.getId());
            long totalVotes = allPollVotes.size();

            // Count votes per poll option
            Map<Long, Long> voteCountsByPollOptionId = allPollVotes.stream()
                    .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));

            List<PollOption> pollOptions = pollOptionRepository.findByPollId(poll.getId());
            List<OptionBreakdownDto> optionsBreakdown = new ArrayList<>();

            long maxVoteCount = 0;
            PollOption winningPollOption = null;

            for (PollOption po : pollOptions) {
                long count = voteCountsByPollOptionId.getOrDefault(po.getId(), 0L);
                double percentage = totalVotes > 0 ? Math.round(((double) count / totalVotes * 100.0) * 100.0) / 100.0 : 0.0;
                
                Long optionId = po.getOption() != null ? po.getOption().getId() : po.getId();
                String optionText = po.getOption() != null ? po.getOption().getLabel() : "Option #" + po.getId();

                optionsBreakdown.add(new OptionBreakdownDto(optionId, optionText, count, percentage));

                if (count > maxVoteCount) {
                    maxVoteCount = count;
                    winningPollOption = po;
                }
            }

            // User choice
            PollOption userPo = userVote.getPollOption();
            Long userOptionId = userPo != null && userPo.getOption() != null ? userPo.getOption().getId() : (userPo != null ? userPo.getId() : null);
            String userOptionText = userPo != null && userPo.getOption() != null ? userPo.getOption().getLabel() : "N/A";
            UserChoiceDto userChoice = new UserChoiceDto(userOptionId, userOptionText);

            // Winning choice & isWinning calculation
            WinningChoiceDto winningChoice;
            boolean isWinning;

            if (totalVotes == 0 || winningPollOption == null || maxVoteCount == 0) {
                winningChoice = new WinningChoiceDto(null, "No votes yet", 0L);
                isWinning = false;
            } else {
                Long winningOptionId = winningPollOption.getOption() != null ? winningPollOption.getOption().getId() : winningPollOption.getId();
                String winningOptionText = winningPollOption.getOption() != null ? winningPollOption.getOption().getLabel() : "Option #" + winningPollOption.getId();
                winningChoice = new WinningChoiceDto(winningOptionId, winningOptionText, maxVoteCount);

                long userChoiceVoteCount = voteCountsByPollOptionId.getOrDefault(userPo != null ? userPo.getId() : -1L, 0L);
                isWinning = (userChoiceVoteCount == maxVoteCount && maxVoteCount > 0);
            }

            result.add(new MyVoteAnalysisDto(
                    decisionId,
                    decisionTitle,
                    status,
                    pollQuestion,
                    totalVotes,
                    userChoice,
                    winningChoice,
                    isWinning,
                    optionsBreakdown
            ));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public CreatorAnalyticsResponse getCreatorAnalytics(String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        List<Decision> creatorDecisions = decisionRepository.findByOwnerIdAndIsDeletedFalse(creator.getId());
        long totalDecisionsPublished = creatorDecisions.size();

        long totalReach = decisionImpressionRepository.countByDecision_Owner_IdAndType(creator.getId(), "REACH");
        long totalViews = decisionImpressionRepository.countByDecision_Owner_IdAndType(creator.getId(), "VIEW");
        long totalVotes = 0;

        List<CreatorDecisionItemDto> decisionItems = new ArrayList<>();

        for (Decision decision : creatorDecisions) {
            long reach = decisionImpressionRepository.countByDecisionIdAndType(decision.getId(), "REACH");
            long views = decisionImpressionRepository.countByDecisionIdAndType(decision.getId(), "VIEW");

            List<Poll> polls = pollRepository.findByDecisionId(decision.getId());
            long decisionVotesCount = 0;
            List<OptionBreakdownDto> optionsDistribution = new ArrayList<>();

            for (Poll poll : polls) {
                List<Vote> pollVotes = voteRepository.findByPollId(poll.getId());
                long pollVoteCount = pollVotes.size();
                decisionVotesCount += pollVoteCount;

                Map<Long, Long> countsByPollOptionId = pollVotes.stream()
                        .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));

                List<PollOption> pollOptions = pollOptionRepository.findByPollId(poll.getId());
                for (PollOption po : pollOptions) {
                    long count = countsByPollOptionId.getOrDefault(po.getId(), 0L);
                    Long optionId = po.getOption() != null ? po.getOption().getId() : po.getId();
                    String optionText = po.getOption() != null ? po.getOption().getLabel() : "Option #" + po.getId();
                    optionsDistribution.add(new OptionBreakdownDto(optionId, optionText, count, 0.0));
                }
            }

            // Recalculate percentages relative to decision total votes
            final long finalDecisionVotes = decisionVotesCount;
            for (OptionBreakdownDto optionDto : optionsDistribution) {
                double pct = finalDecisionVotes > 0
                        ? Math.round(((double) optionDto.getVoteCount() / finalDecisionVotes * 100.0) * 100.0) / 100.0
                        : 0.0;
                optionDto.setPercentage(pct);
            }

            totalVotes += decisionVotesCount;

            double conversionRate = views > 0
                    ? Math.round(((double) decisionVotesCount / views * 100.0) * 100.0) / 100.0
                    : 0.0;

            decisionItems.add(new CreatorDecisionItemDto(
                    decision.getId(),
                    decision.getTitle(),
                    reach,
                    views,
                    decisionVotesCount,
                    conversionRate,
                    decision.getStatus() != null ? decision.getStatus() : "OPEN",
                    decision.getCreatedAt() != null ? decision.getCreatedAt().toString() : "",
                    polls.isEmpty() ? decision.getTitle() : polls.get(0).getQuestion(),
                    optionsDistribution
            ));
        }

        double overallConversionRate = totalViews > 0
                ? Math.round(((double) totalVotes / totalViews * 100.0) * 100.0) / 100.0
                : 0.0;

        return new CreatorAnalyticsResponse(
                totalDecisionsPublished,
                totalReach,
                totalViews,
                totalVotes,
                overallConversionRate,
                decisionItems
        );
    }

    @Transactional
    public void recordImpression(Long decisionId, String type, String userEmail, String clientIp) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + decisionId));

        String sanitizedType = (type != null && !type.isBlank()) ? type.trim().toUpperCase() : "VIEW";
        if (!"VIEW".equals(sanitizedType) && !"REACH".equals(sanitizedType)) {
            throw new IllegalArgumentException("Invalid impression type: " + type + ". Type must be 'REACH' or 'VIEW'.");
        }

        User user = null;
        if (userEmail != null && !userEmail.isBlank()) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        DecisionImpression impression = new DecisionImpression(decision, user, userEmail, clientIp, sanitizedType);
        decisionImpressionRepository.save(impression);
    }

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable("analyticsTrends")
    public List<Map<String, Object>> getDecisionTrends() {
        List<Decision> decisions = decisionRepository.findByIsDeletedFalse();
        Map<String, Long> decisionCountsByDate = new TreeMap<>();
        Map<String, Long> voteCountsByDate = new TreeMap<>();

        for (Decision d : decisions) {
            String dateKey = d.getCreatedAt() != null ? d.getCreatedAt().toLocalDate().toString() : "2026-08-25";
            decisionCountsByDate.put(dateKey, decisionCountsByDate.getOrDefault(dateKey, 0L) + 1);

            List<Poll> polls = pollRepository.findByDecisionId(d.getId());
            for (Poll p : polls) {
                List<Vote> votes = voteRepository.findByPollId(p.getId());
                for (Vote v : votes) {
                    String vDate = v.getVotedAt() != null ? v.getVotedAt().toLocalDate().toString() : dateKey;
                    voteCountsByDate.put(vDate, voteCountsByDate.getOrDefault(vDate, 0L) + 1);
                }
            }
        }

        List<Map<String, Object>> trends = new ArrayList<>();
        Set<String> allDates = new TreeSet<>(decisionCountsByDate.keySet());
        allDates.addAll(voteCountsByDate.keySet());

        for (String date : allDates) {
            trends.add(Map.of(
                    "date", date,
                    "decisionsCreated", decisionCountsByDate.getOrDefault(date, 0L),
                    "votesCast", voteCountsByDate.getOrDefault(date, 0L)
            ));
        }

        return trends;
    }

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable("categories")
    public List<Map<String, Object>> getPopularCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Category cat : categories) {
            long decisionCount = decisionRepository.findByIsDeletedFalse().stream()
                    .filter(d -> d.getCategory() != null && d.getCategory().getId().equals(cat.getId()))
                    .count();

            result.add(Map.of(
                    "id", cat.getId(),
                    "name", cat.getName(),
                    "decisionCount", decisionCount
            ));
        }

        result.sort((a, b) -> Long.compare((Long) b.get("decisionCount"), (Long) a.get("decisionCount")));
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCommunityAnalytics(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found with id: " + communityId));

        List<Decision> communityDecisions = decisionRepository.findByCommunityIdAndIsDeletedFalse(communityId);
        long decisionCount = communityDecisions.size();

        long totalVotes = 0;
        for (Decision d : communityDecisions) {
            List<Poll> polls = pollRepository.findByDecisionId(d.getId());
            for (Poll p : polls) {
                totalVotes += voteRepository.findByPollId(p.getId()).size();
            }
        }

        return Map.of(
                "communityId", community.getId(),
                "communityName", community.getName(),
                "decisionCount", decisionCount,
                "totalVotes", totalVotes
        );
    }

    @Transactional
    public Map<String, String> exportReport(String format, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        String sanitizedFormat = (format != null && "pdf".equalsIgnoreCase(format)) ? "PDF" : "CSV";
        String reportName = "Analytics_Report_" + System.currentTimeMillis() + "." + sanitizedFormat.toLowerCase();

        StringBuilder content = new StringBuilder();
        content.append("DecisionHub Analytics Report\n");
        content.append("Generated At: ").append(new java.util.Date()).append("\n");
        content.append("Generated By: ").append(user.getEmail()).append("\n\n");
        content.append("Total Users: ").append(userRepository.count()).append("\n");
        content.append("Total Decisions: ").append(decisionRepository.count()).append("\n");

        String fileUrl = "/api/files/download/" + reportName;

        GeneratedReport report = new GeneratedReport();
        report.setReportName(reportName);
        report.setFormat(sanitizedFormat);
        report.setFileUrl(fileUrl);
        report.setGeneratedBy(user);
        generatedReportRepository.save(report);

        return Map.of(
                "reportName", reportName,
                "format", sanitizedFormat,
                "fileUrl", fileUrl,
                "content", content.toString()
        );
    }

    public byte[] exportDecisionCsv(Long decisionId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + decisionId));

        long reach = decisionImpressionRepository.countByDecisionIdAndType(decision.getId(), "REACH");
        long views = decisionImpressionRepository.countByDecisionIdAndType(decision.getId(), "VIEW");

        List<Poll> polls = pollRepository.findByDecisionId(decision.getId());
        long totalVotes = 0;
        List<PollOption> pollOptions = new ArrayList<>();
        Map<Long, Long> countsByPoId = new HashMap<>();

        if (!polls.isEmpty()) {
            Poll poll = polls.get(0);
            List<Vote> votes = voteRepository.findByPollId(poll.getId());
            totalVotes = votes.size();
            pollOptions = pollOptionRepository.findByPollId(poll.getId());
            countsByPoId = votes.stream()
                    .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));
        }

        double conversionRate = views > 0
                ? Math.round(((double) totalVotes / views * 100.0) * 100.0) / 100.0
                : 0.0;

        StringBuilder sb = new StringBuilder();

        // 1. Decision Header
        sb.append("DECISION SUMMARY\n");
        sb.append("ID,").append(decision.getId()).append("\n");
        sb.append("Title,\"").append(decision.getTitle().replace("\"", "\"\"")).append("\"\n");
        sb.append("Status,").append(decision.getStatus()).append("\n");
        String ownerName = decision.getOwner() != null ? (decision.getOwner().getFullName() != null ? decision.getOwner().getFullName() : decision.getOwner().getEmail()) : "N/A";
        sb.append("Owner,\"").append(ownerName.replace("\"", "\"\"")).append("\"\n");
        sb.append("Category,").append(decision.getCategory() != null ? decision.getCategory().getName() : "None").append("\n");
        sb.append("Created At,").append(decision.getCreatedAt()).append("\n");
        sb.append("Total Reach,").append(reach).append("\n");
        sb.append("Total Views,").append(views).append("\n");
        sb.append("Total Votes,").append(totalVotes).append("\n");
        sb.append("Conversion Rate (%) ,").append(conversionRate).append("\n");
        String winningLabel = decision.getWinningOption() != null ? decision.getWinningOption().getLabel() : "None";
        sb.append("Winning Option,\"").append(winningLabel.replace("\"", "\"\"")).append("\"\n\n");

        // 2. Poll Vote Breakdown
        sb.append("VOTE DISTRIBUTION BREAKDOWN\n");
        sb.append("Option ID,Option Label,Vote Count,Percentage (%),Winning Option\n");
        for (PollOption po : pollOptions) {
            long c = countsByPoId.getOrDefault(po.getId(), 0L);
            double pct = totalVotes > 0 ? Math.round(((double) c / totalVotes * 100.0) * 100.0) / 100.0 : 0.0;
            String label = po.getOption() != null ? po.getOption().getLabel() : "Option #" + po.getId();
            boolean isWinner = decision.getWinningOption() != null && po.getOption() != null && decision.getWinningOption().getId().equals(po.getOption().getId());
            sb.append(po.getOption() != null ? po.getOption().getId() : po.getId()).append(",")
              .append("\"").append(label.replace("\"", "\"\"")).append("\",")
              .append(c).append(",")
              .append(pct).append(",")
              .append(isWinner ? "YES" : "NO").append("\n");
        }
        sb.append("\n");

        // 3. Comparison Factors Score Matrix
        List<ComparisonFactor> factors = comparisonFactorRepository.findByDecisionId(decision.getId());
        List<DecisionOption> options = decision.getOptions();

        if (!factors.isEmpty() && !options.isEmpty()) {
            sb.append("MULTI-CRITERIA COMPARISON FACTORS SCORE MATRIX\n");
            sb.append("Option / Factor");
            for (ComparisonFactor f : factors) {
                sb.append(",\"").append(f.getName().replace("\"", "\"\"")).append("\"");
            }
            sb.append("\n");

            for (DecisionOption opt : options) {
                sb.append("\"").append(opt.getLabel().replace("\"", "\"\"")).append("\"");
                for (ComparisonFactor f : factors) {
                    List<OptionScore> scores = optionScoreRepository.findByFactorId(f.getId());
                    Optional<OptionScore> optScore = scores.stream()
                            .filter(os -> os.getOption() != null && os.getOption().getId().equals(opt.getId()))
                            .findFirst();
                    Integer scoreVal = optScore.map(OptionScore::getScore).orElse(0);
                    sb.append(",").append(scoreVal);
                }
                sb.append("\n");
            }
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
