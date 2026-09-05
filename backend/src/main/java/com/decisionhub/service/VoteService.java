package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.event.ActivityEvent;
import com.decisionhub.exception.DuplicateVoteException;
import com.decisionhub.exception.PollNotFoundException;
import com.decisionhub.exception.UserNotFoundException;
import com.decisionhub.repository.*;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final ApplicationEventPublisher eventPublisher;

    // Rate Limiter: Caffeine cache for token-bucket (max 5 votes per minute per voter/IP)
    private final Cache<String, AtomicInteger> voteRateLimiter = Caffeine.newBuilder()
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .maximumSize(10_000)
            .build();

    public VoteService(VoteRepository voteRepository,
                       UserRepository userRepository,
                       PollRepository pollRepository,
                       PollOptionRepository pollOptionRepository,
                       ApplicationEventPublisher eventPublisher) {
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.eventPublisher = eventPublisher;
    }

    public void checkRateLimit(String key) {
        if (key == null || key.isBlank()) {
            key = "anonymous";
        }
        AtomicInteger counter = voteRateLimiter.get(key, k -> new AtomicInteger(0));
        if (counter.incrementAndGet() > 5) {
            throw new IllegalArgumentException("Rate limit exceeded. Maximum 5 votes per minute allowed.");
        }
    }

    public void resetRateLimit(String key) {
        if (key != null) {
            voteRateLimiter.invalidate(key);
        } else {
            voteRateLimiter.invalidateAll();
        }
    }

    @Transactional
    public VoteResponse castVote(VoteRequest request, String userEmail) {
        return castVote(request, userEmail, null);
    }

    @Transactional
    public VoteResponse castVote(VoteRequest request, String userEmail, String clientIp) {
        String rateLimitKey = (userEmail != null && !userEmail.isBlank()) ? userEmail : (clientIp != null ? clientIp : "anonymous");
        checkRateLimit(rateLimitKey);

        User voter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmail));

        Poll poll = pollRepository.findById(request.getPollId())
                .orElseThrow(() -> new PollNotFoundException("Poll not found with id: " + request.getPollId()));

        // Check if poll or decision is closed/expired
        if (poll.getEndsAt() != null && LocalDateTime.now().isAfter(poll.getEndsAt())) {
            throw new IllegalArgumentException("Poll has expired and is no longer accepting votes");
        }
        if (poll.getDecision() != null && ("CLOSED".equalsIgnoreCase(poll.getDecision().getStatus()) || "EXPIRED".equalsIgnoreCase(poll.getDecision().getStatus()))) {
            throw new IllegalArgumentException("Decision is " + poll.getDecision().getStatus().toLowerCase() + " and is no longer accepting votes");
        }

        String votingMethod = poll.getVotingMethod();
        boolean allowRevoting = Boolean.TRUE.equals(poll.getAllowRevoting());

        // Handle Revoting or Duplicate checking
        if (allowRevoting) {
            voteRepository.deleteByPollIdAndVoterId(poll.getId(), voter.getId());
            voteRepository.flush();
        } else {
            // Check for duplicate vote
            if ("APPROVAL".equalsIgnoreCase(votingMethod) || "MULTI".equalsIgnoreCase(poll.getPollType())) {
                if (request.getPollOptionId() != null && voteRepository.existsByPollOptionIdAndVoterId(request.getPollOptionId(), voter.getId())) {
                    throw new DuplicateVoteException("User has already voted for this option");
                }
            } else {
                if (voteRepository.existsByPollIdAndVoterId(poll.getId(), voter.getId())) {
                    throw new DuplicateVoteException("User has already voted on this poll");
                }
            }
        }

        List<PollOption> pollOptions = pollOptionRepository.findByPollId(poll.getId());
        Map<Long, PollOption> pollOptionMapById = pollOptions.stream()
                .collect(Collectors.toMap(PollOption::getId, po -> po));
        Map<Long, PollOption> pollOptionMapByOptionId = pollOptions.stream()
                .collect(Collectors.toMap(po -> po.getOption().getId(), po -> po, (existing, replacement) -> existing));

        Vote firstSavedVote = null;

        // 1. RANKED CHOICE VOTING
        if ("RANKED_CHOICE".equalsIgnoreCase(votingMethod) || "RANKED_CHOICE".equalsIgnoreCase(poll.getPollType())) {
            List<Long> rankedOptionIds = request.getRankedOptionIds();
            if (rankedOptionIds != null && !rankedOptionIds.isEmpty()) {
                for (int i = 0; i < rankedOptionIds.size(); i++) {
                    Long targetId = rankedOptionIds.get(i);
                    PollOption po = pollOptionMapById.get(targetId);
                    if (po == null) {
                        po = pollOptionMapByOptionId.get(targetId);
                    }
                    if (po == null) {
                        throw new IllegalArgumentException("Poll option not found for id: " + targetId);
                    }
                    Vote vote = new Vote();
                    vote.setPoll(poll);
                    vote.setPollOption(po);
                    vote.setVoter(voter);
                    vote.setRankPosition(i + 1);
                    Vote saved = voteRepository.save(vote);
                    if (firstSavedVote == null) {
                        firstSavedVote = saved;
                    }
                }
            } else if (request.getPollOptionId() != null) {
                PollOption po = pollOptionMapById.get(request.getPollOptionId());
                if (po == null) {
                    po = pollOptionMapByOptionId.get(request.getPollOptionId());
                }
                if (po == null) {
                    throw new IllegalArgumentException("Poll option not found with id: " + request.getPollOptionId());
                }
                Vote vote = new Vote();
                vote.setPoll(poll);
                vote.setPollOption(po);
                vote.setVoter(voter);
                vote.setRankPosition(request.getRankPosition() != null ? request.getRankPosition() : 1);
                firstSavedVote = voteRepository.save(vote);
            } else {
                throw new IllegalArgumentException("Ranked choices are required for RANKED_CHOICE voting");
            }
        }
        // 2. APPROVAL VOTING
        else if ("APPROVAL".equalsIgnoreCase(votingMethod)) {
            List<Long> optionIds = request.getOptionIds();
            if (optionIds != null && !optionIds.isEmpty()) {
                int maxChoices = poll.getMaxChoices() != null ? poll.getMaxChoices() : optionIds.size();
                if (optionIds.size() > maxChoices) {
                    throw new IllegalArgumentException("Exceeded maximum choices allowed (" + maxChoices + ")");
                }
                for (Long targetId : optionIds) {
                    PollOption po = pollOptionMapById.get(targetId);
                    if (po == null) {
                        po = pollOptionMapByOptionId.get(targetId);
                    }
                    if (po == null) {
                        throw new IllegalArgumentException("Poll option not found for id: " + targetId);
                    }
                    Vote vote = new Vote();
                    vote.setPoll(poll);
                    vote.setPollOption(po);
                    vote.setVoter(voter);
                    Vote saved = voteRepository.save(vote);
                    if (firstSavedVote == null) {
                        firstSavedVote = saved;
                    }
                }
            } else if (request.getPollOptionId() != null) {
                PollOption po = pollOptionMapById.get(request.getPollOptionId());
                if (po == null) {
                    po = pollOptionMapByOptionId.get(request.getPollOptionId());
                }
                if (po == null) {
                    throw new IllegalArgumentException("Poll option not found with id: " + request.getPollOptionId());
                }
                Vote vote = new Vote();
                vote.setPoll(poll);
                vote.setPollOption(po);
                vote.setVoter(voter);
                firstSavedVote = voteRepository.save(vote);
            } else {
                throw new IllegalArgumentException("Option selection required for APPROVAL voting");
            }
        }
        // 3. SINGLE_CHOICE / RATING / MULTI VOTING
        else {
            if (request.getPollOptionId() == null) {
                throw new IllegalArgumentException("Poll Option ID is required");
            }
            PollOption pollOption = pollOptionMapById.get(request.getPollOptionId());
            if (pollOption == null) {
                pollOption = pollOptionMapByOptionId.get(request.getPollOptionId());
            }
            if (pollOption == null) {
                throw new IllegalArgumentException("Poll option not found with id: " + request.getPollOptionId());
            }

            // Check rating bounds for RATING polls
            if ("RATING".equalsIgnoreCase(poll.getPollType())) {
                if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
                    throw new IllegalArgumentException("Rating must be between 1 and 5 for RATING polls");
                }
            }

            Vote vote = new Vote();
            vote.setPoll(poll);
            vote.setPollOption(pollOption);
            vote.setVoter(voter);
            vote.setRating(request.getRating());

            firstSavedVote = voteRepository.save(vote);
        }

        if (eventPublisher != null && firstSavedVote != null) {
            Long commId = poll.getDecision() != null && poll.getDecision().getCommunity() != null
                    ? poll.getDecision().getCommunity().getId() : null;
            String vis = poll.getDecision() != null && poll.getDecision().getVisibility() != null
                    ? poll.getDecision().getVisibility() : "PUBLIC";
            String title = "Voted on: " + (poll.getDecision() != null ? poll.getDecision().getTitle() : "Poll #" + poll.getId());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("pollId", poll.getId());
            if (poll.getDecision() != null) {
                metadata.put("decisionId", poll.getDecision().getId());
            }
            metadata.put("optionLabel", firstSavedVote.getPollOption().getOption().getLabel());
            if (firstSavedVote.getRating() != null) {
                metadata.put("rating", firstSavedVote.getRating());
            }

            eventPublisher.publishEvent(new ActivityEvent(
                    voter.getId(),
                    "VOTE_CAST",
                    "VOTE",
                    firstSavedVote.getId(),
                    commId,
                    title,
                    metadata,
                    vis
            ));
        }

        if (poll.getDecision() != null && poll.getDecision().getOwner() != null && !poll.getDecision().getOwner().getId().equals(voter.getId())) {
            String msg = voter.getFullName() + " voted on your poll for decision: " + poll.getDecision().getTitle();
            eventPublisher.publishEvent(new com.decisionhub.event.NotificationEvent(this, poll.getDecision().getOwner(), "NEW_VOTE", msg, "New Vote Received"));
        }

        return new VoteResponse(
                firstSavedVote.getId(),
                poll.getId(),
                firstSavedVote.getPollOption().getId(),
                voter.getId(),
                firstSavedVote.getPollOption().getOption().getLabel(),
                firstSavedVote.getRating(),
                firstSavedVote.getVotedAt()
        );
    }

    @Transactional(readOnly = true)
    public VoteResultResponse getVoteResults(Long pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new PollNotFoundException("Poll not found with id: " + pollId));

        List<Vote> votes = voteRepository.findByPollId(pollId);
        int totalVotes = votes.size();

        List<PollOption> pollOptions = pollOptionRepository.findByPollId(pollId);
        String votingMethod = poll.getVotingMethod();
        Decision decision = poll.getDecision();

        // 1. RANKED CHOICE VOTING (Instant Runoff Voting - IRV)
        if ("RANKED_CHOICE".equalsIgnoreCase(votingMethod) || "RANKED_CHOICE".equalsIgnoreCase(poll.getPollType())) {
            return tallyInstantRunoffVoting(poll, decision, votes, pollOptions);
        }

        // 2. STANDARD / APPROVAL / SINGLE_CHOICE TALLY
        Map<Long, Long> voteCounts = votes.stream()
                .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));

        List<OptionDto> optionDtos = pollOptions.stream()
                .map(po -> {
                    long count = voteCounts.getOrDefault(po.getId(), 0L);
                    double pct = (totalVotes > 0) ? (count * 100.0 / totalVotes) : 0.0;
                    pct = Math.round(pct * 100.0) / 100.0;
                    return new OptionDto(po.getOption().getId(), po.getOption().getLabel(),
                            po.getOption().getDescription(), count, pct);
                })
                .collect(Collectors.toList());

        String winningOption = "No votes yet";
        Long winningOptionId = null;
        int winningCount = 0;

        if (!voteCounts.isEmpty()) {
            long maxCount = voteCounts.values().stream().max(Long::compare).orElse(0L);
            if (maxCount > 0) {
                winningCount = (int) maxCount;
                List<Long> winnerPoIds = voteCounts.entrySet().stream()
                        .filter(e -> e.getValue() == maxCount)
                        .map(Map.Entry::getKey)
                        .collect(Collectors.toList());

                List<PollOption> winningPos = pollOptions.stream()
                        .filter(po -> winnerPoIds.contains(po.getId()))
                        .collect(Collectors.toList());

                List<String> winnerLabels = winningPos.stream()
                        .map(po -> po.getOption().getLabel())
                        .collect(Collectors.toList());

                winningOption = String.join(", ", winnerLabels);
                if (!winningPos.isEmpty()) {
                    winningOptionId = winningPos.get(0).getOption().getId();
                }
            }
        }

        return new VoteResultResponse(
                poll.getId(),
                decision != null ? decision.getId() : null,
                decision != null ? decision.getTitle() : "N/A",
                poll.getPollType(),
                votingMethod,
                totalVotes,
                winningOptionId,
                winningOption,
                winningCount,
                optionDtos,
                Collections.emptyList()
        );
    }

    private VoteResultResponse tallyInstantRunoffVoting(Poll poll, Decision decision, List<Vote> votes, List<PollOption> pollOptions) {
        Map<Long, String> optionLabels = pollOptions.stream()
                .collect(Collectors.toMap(PollOption::getId, po -> po.getOption().getLabel()));
        Map<Long, Long> decisionOptionIdMap = pollOptions.stream()
                .collect(Collectors.toMap(PollOption::getId, po -> po.getOption().getId()));

        // Group votes by voter
        Map<Long, List<Vote>> votesByVoter = votes.stream()
                .filter(v -> v.getVoter() != null)
                .collect(Collectors.groupingBy(v -> v.getVoter().getId()));

        List<List<Long>> ballots = new ArrayList<>();
        for (List<Vote> voterVotes : votesByVoter.values()) {
            List<Long> ordered = voterVotes.stream()
                    .sorted(Comparator.comparing(v -> v.getRankPosition() != null ? v.getRankPosition() : Integer.MAX_VALUE))
                    .map(v -> v.getPollOption().getId())
                    .distinct()
                    .collect(Collectors.toList());
            if (!ordered.isEmpty()) {
                ballots.add(ordered);
            }
        }

        Set<Long> activeCandidates = pollOptions.stream().map(PollOption::getId).collect(Collectors.toSet());
        List<RankingRoundDto> roundsBreakdown = new ArrayList<>();
        Long winningPoId = null;
        String winningOptionLabel = "No votes yet";
        int winningCount = 0;
        int roundNumber = 1;

        // First round vote counts for options display
        Map<Long, Long> firstRoundCounts = new HashMap<>();
        for (PollOption po : pollOptions) {
            firstRoundCounts.put(po.getId(), 0L);
        }
        for (List<Long> b : ballots) {
            if (!b.isEmpty()) {
                firstRoundCounts.put(b.get(0), firstRoundCounts.getOrDefault(b.get(0), 0L) + 1);
            }
        }

        while (!activeCandidates.isEmpty()) {
            Map<Long, Long> roundCounts = new HashMap<>();
            for (Long cId : activeCandidates) {
                roundCounts.put(cId, 0L);
            }

            long activeBallots = 0;
            for (List<Long> ballot : ballots) {
                for (Long cId : ballot) {
                    if (activeCandidates.contains(cId)) {
                        roundCounts.put(cId, roundCounts.get(cId) + 1);
                        activeBallots++;
                        break;
                    }
                }
            }

            Map<Long, Double> roundPercentages = new HashMap<>();
            for (Map.Entry<Long, Long> entry : roundCounts.entrySet()) {
                double pct = (activeBallots > 0) ? (entry.getValue() * 100.0 / activeBallots) : 0.0;
                pct = Math.round(pct * 100.0) / 100.0;
                roundPercentages.put(entry.getKey(), pct);
            }

            Long leader = null;
            long maxVotes = -1;
            for (Map.Entry<Long, Long> entry : roundCounts.entrySet()) {
                if (entry.getValue() > maxVotes) {
                    maxVotes = entry.getValue();
                    leader = entry.getKey();
                }
            }

            boolean hasStrictMajority = (activeBallots > 0) && (maxVotes > activeBallots / 2.0);
            boolean isSingleCandidateLeft = (activeCandidates.size() == 1);

            if (hasStrictMajority || isSingleCandidateLeft || activeBallots == 0) {
                winningPoId = leader;
                winningOptionLabel = leader != null ? optionLabels.getOrDefault(leader, "Unknown") : "No votes yet";
                winningCount = (int) Math.max(0, maxVotes);
                roundsBreakdown.add(new RankingRoundDto(
                        roundNumber,
                        roundCounts,
                        roundPercentages,
                        null,
                        null,
                        true,
                        winningPoId != null ? decisionOptionIdMap.get(winningPoId) : null,
                        winningOptionLabel
                ));
                break;
            }

            // Find lowest vote candidate to eliminate
            long minVotes = Long.MAX_VALUE;
            for (Long v : roundCounts.values()) {
                if (v < minVotes) {
                    minVotes = v;
                }
            }

            final long finalMinVotes = minVotes;
            List<Long> lowestCandidates = roundCounts.entrySet().stream()
                    .filter(e -> e.getValue() == finalMinVotes)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            // If all remaining are tied, finish with leader
            if (lowestCandidates.size() == activeCandidates.size()) {
                winningPoId = leader;
                winningOptionLabel = leader != null ? optionLabels.getOrDefault(leader, "Unknown") : "No votes yet";
                winningCount = (int) Math.max(0, maxVotes);
                roundsBreakdown.add(new RankingRoundDto(
                        roundNumber,
                        roundCounts,
                        roundPercentages,
                        null,
                        null,
                        true,
                        winningPoId != null ? decisionOptionIdMap.get(winningPoId) : null,
                        winningOptionLabel
                ));
                break;
            }

            Long eliminatedPoId = lowestCandidates.get(0);
            String elimLabel = optionLabels.getOrDefault(eliminatedPoId, "Unknown");

            roundsBreakdown.add(new RankingRoundDto(
                    roundNumber,
                    roundCounts,
                    roundPercentages,
                    decisionOptionIdMap.get(eliminatedPoId),
                    elimLabel,
                    false,
                    null,
                    null
            ));

            activeCandidates.remove(eliminatedPoId);
            roundNumber++;
        }

        int totalVoterBallots = ballots.size();
        List<OptionDto> optionDtos = pollOptions.stream()
                .map(po -> {
                    long count = firstRoundCounts.getOrDefault(po.getId(), 0L);
                    double pct = (totalVoterBallots > 0) ? (count * 100.0 / totalVoterBallots) : 0.0;
                    pct = Math.round(pct * 100.0) / 100.0;
                    return new OptionDto(po.getOption().getId(), po.getOption().getLabel(),
                            po.getOption().getDescription(), count, pct);
                })
                .collect(Collectors.toList());

        Long winnerDecisionOptionId = winningPoId != null ? decisionOptionIdMap.get(winningPoId) : null;

        return new VoteResultResponse(
                poll.getId(),
                decision != null ? decision.getId() : null,
                decision != null ? decision.getTitle() : "N/A",
                poll.getPollType(),
                poll.getVotingMethod(),
                votes.size(),
                winnerDecisionOptionId,
                winningOptionLabel,
                winningCount,
                optionDtos,
                roundsBreakdown
        );
    }

    @Transactional(readOnly = true)
    public PollRatingSummaryResponse getRatingSummary(Long pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new PollNotFoundException("Poll not found with id: " + pollId));

        if (!"RATING".equalsIgnoreCase(poll.getPollType())) {
            throw new IllegalArgumentException("Poll must be of type RATING to get rating summary");
        }

        List<Vote> votes = voteRepository.findByPollId(pollId);
        
        // Calculate overall average
        double overallAverage = 0.0;
        long totalVotesWithRating = 0;
        double overallSum = 0.0;
        for (Vote v : votes) {
            if (v.getRating() != null) {
                overallSum += v.getRating();
                totalVotesWithRating++;
            }
        }
        if (totalVotesWithRating > 0) {
            overallAverage = Math.round((overallSum / totalVotesWithRating) * 100.0) / 100.0;
        }

        List<PollOption> pollOptions = pollOptionRepository.findByPollId(pollId);

        // Group votes by option
        Map<Long, List<Vote>> optionVotes = votes.stream()
                .collect(Collectors.groupingBy(v -> v.getPollOption().getId()));

        List<OptionRatingSummaryDto> optionRatings = pollOptions.stream()
                .map(po -> {
                    List<Vote> list = optionVotes.getOrDefault(po.getId(), Collections.emptyList());
                    long count = 0;
                    double sum = 0.0;
                    for (Vote v : list) {
                        if (v.getRating() != null) {
                            sum += v.getRating();
                            count++;
                        }
                    }
                    double avg = (count > 0) ? Math.round((sum / count) * 100.0) / 100.0 : 0.0;
                    return new OptionRatingSummaryDto(
                            po.getOption().getId(),
                            po.getOption().getLabel(),
                            avg,
                            count
                    );
                })
                .collect(Collectors.toList());

        return new PollRatingSummaryResponse(
                poll.getId(),
                overallAverage,
                totalVotesWithRating,
                optionRatings
        );
    }
}
