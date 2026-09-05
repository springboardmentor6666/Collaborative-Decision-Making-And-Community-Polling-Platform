package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.CommunityNotFoundException;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import com.decisionhub.event.ActivityEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DecisionService {

    private final DecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final DecisionOptionRepository decisionOptionRepository;
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final VoteRepository voteRepository;
    private final ComparisonFactorRepository comparisonFactorRepository;
    private final OptionScoreRepository optionScoreRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;
    private final VoteService voteService;

    public DecisionService(DecisionRepository decisionRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           CommunityRepository communityRepository,
                           CommunityMemberRepository communityMemberRepository,
                           DecisionOptionRepository decisionOptionRepository,
                           PollRepository pollRepository,
                           PollOptionRepository pollOptionRepository,
                           VoteRepository voteRepository,
                           ComparisonFactorRepository comparisonFactorRepository,
                           OptionScoreRepository optionScoreRepository,
                           UserService userService,
                           ApplicationEventPublisher eventPublisher,
                           @Lazy VoteService voteService) {
        this.decisionRepository = decisionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.communityRepository = communityRepository;
        this.communityMemberRepository = communityMemberRepository;
        this.decisionOptionRepository = decisionOptionRepository;
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.voteRepository = voteRepository;
        this.comparisonFactorRepository = comparisonFactorRepository;
        this.optionScoreRepository = optionScoreRepository;
        this.userService = userService;
        this.eventPublisher = eventPublisher;
        this.voteService = voteService;
    }

    @org.springframework.cache.annotation.CacheEvict(value = {"categories", "popularCategories"}, allEntries = true)
    @Transactional
    public DecisionResponse createDecision(DecisionRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        Decision decision = new Decision();
        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        decision.setOwner(owner);
        decision.setStatus(request.getStatus() != null && !request.getStatus().isBlank() 
                ? request.getStatus().trim().toUpperCase() : "OPEN");
        decision.setAutoClose(request.getAutoClose() != null ? request.getAutoClose() : false);
        decision.setEndsAt(request.getEndsAt());

        if (request.getVisibility() != null) {
            decision.setVisibility(request.getVisibility());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            decision.setCategory(category);
        }

        if (request.getCommunityId() != null) {
            Community community = communityRepository.findById(request.getCommunityId())
                    .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + request.getCommunityId()));
            
            // Server-side authorization check: User must be a member of the community to post group decisions
            boolean isMember = communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), owner.getId());
            if (!isMember) {
                throw new AccessDeniedException("Only community members can create decisions inside this community");
            }
            decision.setCommunity(community);
        }

        // Create embedded poll + decision options if provided
        if (request.getOptionLabels() != null && !request.getOptionLabels().isEmpty()) {
            // Create decision options
            for (String label : request.getOptionLabels()) {
                if (label != null && !label.trim().isEmpty()) {
                    DecisionOption option = new DecisionOption();
                    option.setLabel(label.trim());
                    option.setDecision(decision);
                    decision.getOptions().add(option);
                }
            }

            // Create poll if pollType is specified
            if (request.getPollType() != null && !request.getPollType().trim().isEmpty()) {
                Poll poll = new Poll();
                poll.setPollType(request.getPollType());
                poll.setVotingMethod(request.getVotingMethod() != null ? request.getVotingMethod() : request.getPollType());
                poll.setMaxChoices(request.getMaxChoices() != null ? request.getMaxChoices() : 1);
                poll.setAllowRevoting(request.getAllowRevoting() != null ? request.getAllowRevoting() : false);
                poll.setEndsAt(request.getEndsAt());
                if (request.getPollQuestion() != null && !request.getPollQuestion().trim().isEmpty()) {
                    poll.setQuestion(request.getPollQuestion().trim());
                }
                poll.setIsAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false);
                poll.setDecision(decision);
                decision.getPolls().add(poll);
            }
        }

        // Create Comparison Factors if provided
        if (request.getComparisonFactorNames() != null && !request.getComparisonFactorNames().isEmpty()) {
            for (String factorName : request.getComparisonFactorNames()) {
                if (factorName != null && !factorName.trim().isEmpty()) {
                    ComparisonFactor factor = new ComparisonFactor();
                    factor.setName(factorName.trim());
                    factor.setDecision(decision);
                    decision.getComparisonFactors().add(factor);
                }
            }
        }

        Decision savedDecision = decisionRepository.save(decision);

        // Create PollOption records linking each DecisionOption to the Poll
        if (!savedDecision.getPolls().isEmpty() && !savedDecision.getOptions().isEmpty()) {
            Poll savedPoll = savedDecision.getPolls().get(0);
            for (DecisionOption option : savedDecision.getOptions()) {
                PollOption pollOption = new PollOption();
                pollOption.setPoll(savedPoll);
                pollOption.setOption(option);
                PollOption savedPo = pollOptionRepository.save(pollOption);
                savedPoll.getPollOptions().add(savedPo);
            }
        }

        // Save Option Scores if comparison factors and option scores were supplied
        if (request.getOptionScores() != null && !request.getOptionScores().isEmpty() &&
                !savedDecision.getOptions().isEmpty() && !savedDecision.getComparisonFactors().isEmpty()) {
            for (OptionScoreDto scoreDto : request.getOptionScores()) {
                DecisionOption opt = savedDecision.getOptions().stream()
                        .filter(o -> (scoreDto.getOptionId() != null && o.getId().equals(scoreDto.getOptionId())) ||
                                (scoreDto.getOptionLabel() != null && o.getLabel().equalsIgnoreCase(scoreDto.getOptionLabel().trim())))
                        .findFirst().orElse(null);

                ComparisonFactor factor = savedDecision.getComparisonFactors().stream()
                        .filter(f -> (scoreDto.getFactorId() != null && f.getId().equals(scoreDto.getFactorId())) ||
                                (scoreDto.getFactorName() != null && f.getName().equalsIgnoreCase(scoreDto.getFactorName().trim())))
                        .findFirst().orElse(null);

                if (opt != null && factor != null && scoreDto.getScore() != null) {
                    OptionScore os = new OptionScore();
                    os.setOption(opt);
                    os.setFactor(factor);
                    os.setScore(scoreDto.getScore());
                    optionScoreRepository.save(os);
                }
            }
        }

        if (eventPublisher != null) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("decisionId", savedDecision.getId());
            metadata.put("title", savedDecision.getTitle());
            eventPublisher.publishEvent(new ActivityEvent(
                    owner.getId(),
                    "DECISION_CREATED",
                    "DECISION",
                    savedDecision.getId(),
                    savedDecision.getCommunity() != null ? savedDecision.getCommunity().getId() : null,
                    "Created decision: " + savedDecision.getTitle(),
                    metadata,
                    savedDecision.getVisibility()
            ));
        }

        return mapToDecisionResponse(savedDecision);
    }

    @Transactional
    public List<DecisionResponse> getAllDecisions() {
        return decisionRepository.findByIsDeletedFalse().stream()
                .map(this::mapToDecisionResponse)
                .toList();
    }

    @Transactional
    public Page<DecisionResponse> getDecisions(Long categoryId, String status, String search, Pageable pageable) {
        String sanitizedStatus = (status != null && !status.isBlank()) ? status.trim() : null;
        String sanitizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Decision> decisionsPage = decisionRepository.findWithFilters(categoryId, sanitizedStatus, sanitizedSearch, pageable);
        return decisionsPage.map(this::mapToDecisionResponse);
    }

    @Transactional
    public DecisionResponse getDecisionById(Long id) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + id));
        return mapToDecisionResponse(decision);
    }

    @Transactional
    public List<DecisionResponse> getDecisionsByCommunityId(Long communityId, String userEmail) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found with id: " + communityId));

        if ("PRIVATE".equalsIgnoreCase(community.getVisibility())) {
            if (userEmail == null || userEmail.isBlank()) {
                throw new AccessDeniedException("Access denied to private community decisions");
            }
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user == null || !communityMemberRepository.existsByCommunityIdAndUserId(communityId, user.getId())) {
                throw new AccessDeniedException("Access denied to private community decisions");
            }
        }

        List<Decision> decisions = decisionRepository.findByCommunityIdAndIsDeletedFalse(communityId);
        return decisions.stream()
                .map(this::mapToDecisionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DecisionResponse updateDecision(Long id, DecisionRequest request, String userEmail) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + id));

        User requestingUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        // Owner or ADMIN authorization check
        boolean isOwner = decision.getOwner() != null && decision.getOwner().getEmail().equalsIgnoreCase(userEmail);
        boolean isAdmin = requestingUser.getRole() != null && "ADMIN".equalsIgnoreCase(requestingUser.getRole());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to edit this decision");
        }

        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        if (request.getVisibility() != null) {
            decision.setVisibility(request.getVisibility());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            decision.setCategory(category);
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            decision.setStatus(request.getStatus().trim().toUpperCase());
        }
        if (request.getAutoClose() != null) {
            decision.setAutoClose(request.getAutoClose());
        }
        if (request.getEndsAt() != null) {
            decision.setEndsAt(request.getEndsAt());
        }

        Decision updatedDecision = decisionRepository.save(decision);
        return mapToDecisionResponse(updatedDecision);
    }

    @Transactional
    public void deleteDecision(Long id, String userEmail) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + id));

        User requestingUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        // Owner, ADMIN, or MODERATOR authorization check
        boolean isOwner = decision.getOwner() != null && decision.getOwner().getEmail().equalsIgnoreCase(userEmail);
        boolean isModeratorOrAdmin = requestingUser.getRole() != null && (
                "ADMIN".equalsIgnoreCase(requestingUser.getRole()) ||
                "MODERATOR".equalsIgnoreCase(requestingUser.getRole())
        );

        if (!isOwner && !isModeratorOrAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this decision");
        }

        // Soft delete
        decision.setIsDeleted(true);
        decisionRepository.save(decision);
    }

    @Transactional
    public OptionDto addOption(Long decisionId, OptionRequest request, String userEmail) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + decisionId));

        User requestingUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        // Owner or ADMIN authorization check
        boolean isOwner = decision.getOwner() != null && decision.getOwner().getEmail().equalsIgnoreCase(userEmail);
        boolean isAdmin = requestingUser.getRole() != null && "ADMIN".equalsIgnoreCase(requestingUser.getRole());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to add options to this decision");
        }

        checkAndApplyStatusTransition(decision);

        if ("CLOSED".equalsIgnoreCase(decision.getStatus()) || "EXPIRED".equalsIgnoreCase(decision.getStatus())) {
            throw new IllegalStateException("Cannot add options to a closed or expired decision");
        }

        DecisionOption option = new DecisionOption();
        option.setLabel(request.getLabel().trim());
        option.setDescription(request.getDescription());
        option.setDecision(decision);

        DecisionOption savedOption = decisionOptionRepository.save(option);
        decision.getOptions().add(savedOption);

        // If decision has existing polls, create PollOption records to wire the new option into voting
        List<Poll> polls = pollRepository.findByDecisionId(decision.getId());
        for (Poll poll : polls) {
            PollOption pollOption = new PollOption();
            pollOption.setPoll(poll);
            pollOption.setOption(savedOption);
            pollOptionRepository.save(pollOption);
            poll.getPollOptions().add(pollOption);
        }

        if (eventPublisher != null) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("decisionId", decision.getId());
            metadata.put("optionId", savedOption.getId());
            metadata.put("optionLabel", savedOption.getLabel());
            eventPublisher.publishEvent(new ActivityEvent(
                    requestingUser.getId(),
                    "OPTION_ADDED",
                    "OPTION",
                    savedOption.getId(),
                    decision.getCommunity() != null ? decision.getCommunity().getId() : null,
                    "Added option '" + savedOption.getLabel() + "' to " + decision.getTitle(),
                    metadata,
                    decision.getVisibility()
            ));
        }

        return new OptionDto(savedOption.getId(), savedOption.getLabel(), savedOption.getDescription(), 0L);
    }

    @Transactional
    public DecisionResponse closeDecision(Long id, String userEmail) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + id));

        boolean isSystem = "SYSTEM".equalsIgnoreCase(userEmail);
        User requestingUser = null;
        if (!isSystem) {
            requestingUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

            boolean isOwner = decision.getOwner() != null && decision.getOwner().getEmail().equalsIgnoreCase(userEmail);
            boolean isAdmin = requestingUser.getRole() != null && "ADMIN".equalsIgnoreCase(requestingUser.getRole());

            if (!isOwner && !isAdmin) {
                throw new AccessDeniedException("You are not authorized to close this decision");
            }
        }

        // Determine winning option if polls exist
        List<Poll> polls = pollRepository.findByDecisionId(decision.getId());
        if (!polls.isEmpty()) {
            Poll poll = polls.get(0);
            try {
                VoteResultResponse result = voteService.getVoteResults(poll.getId());
                if (result.getWinningOptionId() != null) {
                    DecisionOption winningOpt = decisionOptionRepository.findById(result.getWinningOptionId()).orElse(null);
                    if (winningOpt != null) {
                        decision.setWinningOption(winningOpt);
                    }
                }
            } catch (Exception ignored) {
            }
        }

        decision.setStatus("CLOSED");
        Decision updatedDecision = decisionRepository.save(decision);

        if (eventPublisher != null) {
            Long actorId = requestingUser != null ? requestingUser.getId() : (decision.getOwner() != null ? decision.getOwner().getId() : 1L);
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("decisionId", updatedDecision.getId());
            metadata.put("title", updatedDecision.getTitle());
            if (updatedDecision.getWinningOption() != null) {
                metadata.put("winningOptionId", updatedDecision.getWinningOption().getId());
                metadata.put("winningOptionLabel", updatedDecision.getWinningOption().getLabel());
            }
            eventPublisher.publishEvent(new ActivityEvent(
                    actorId,
                    "DECISION_CLOSED",
                    "DECISION",
                    updatedDecision.getId(),
                    updatedDecision.getCommunity() != null ? updatedDecision.getCommunity().getId() : null,
                    "Closed decision: " + updatedDecision.getTitle(),
                    metadata,
                    updatedDecision.getVisibility()
            ));
        }

        return mapToDecisionResponse(updatedDecision);
    }

    public void checkAndApplyStatusTransition(Decision decision) {
        if (decision == null) return;
        String currentStatus = decision.getStatus();
        if (currentStatus == null || "OPEN".equalsIgnoreCase(currentStatus)) {
            // Check if any attached poll has an expired deadline
            List<Poll> polls = pollRepository.findByDecisionId(decision.getId());
            boolean isExpired = false;
            for (Poll poll : polls) {
                if (poll.getEndsAt() != null && LocalDateTime.now().isAfter(poll.getEndsAt())) {
                    isExpired = true;
                    break;
                }
            }
            if (isExpired) {
                decision.setStatus("EXPIRED");
                decisionRepository.save(decision);
            }
        }
    }

    public DecisionResponse mapToDecisionResponse(Decision decision) {
        checkAndApplyStatusTransition(decision);

        List<PollResponse> pollResponses = new ArrayList<>();
        List<OptionDto> allOptions = new ArrayList<>();

        List<Poll> polls = pollRepository.findByDecisionId(decision.getId());
        if (polls != null && !polls.isEmpty()) {
            for (Poll poll : polls) {
                List<Vote> pollVotes = voteRepository.findByPollId(poll.getId());
                Map<Long, Long> voteCounts = pollVotes.stream()
                        .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));

                List<OptionDto> optionDtos = new ArrayList<>();
                List<PollOption> pollOptions = pollOptionRepository.findByPollId(poll.getId());
                if (pollOptions != null) {
                    optionDtos = pollOptions.stream()
                            .map(po -> new OptionDto(
                                    po.getOption().getId(),
                                    po.getOption().getLabel(),
                                    po.getOption().getDescription(),
                                    voteCounts.getOrDefault(po.getId(), 0L)))
                            .collect(Collectors.toList());
                    allOptions.addAll(optionDtos);
                }
                pollResponses.add(new PollResponse(
                        poll.getId(),
                        decision.getId(),
                        poll.getPollType(),
                        poll.getVotingMethod(),
                        poll.getMaxChoices(),
                        poll.getAllowRevoting(),
                        poll.getQuestion(),
                        poll.getIsAnonymous(),
                        poll.getEndsAt(),
                        optionDtos
                ));
            }
        } else if (decision.getOptions() != null && !decision.getOptions().isEmpty()) {
            allOptions = decision.getOptions().stream()
                    .map(o -> new OptionDto(o.getId(), o.getLabel(), o.getDescription(), 0L))
                    .collect(Collectors.toList());
        }

        // Map comparison factors
        List<ComparisonFactor> factors = comparisonFactorRepository.findByDecisionId(decision.getId());
        List<ComparisonFactorDto> factorDtos = factors.stream()
                .map(f -> new ComparisonFactorDto(f.getId(), f.getName()))
                .collect(Collectors.toList());

        // Map option scores
        List<OptionScoreDto> scoreDtos = new ArrayList<>();
        for (ComparisonFactor f : factors) {
            List<OptionScore> scores = optionScoreRepository.findByFactorId(f.getId());
            for (OptionScore os : scores) {
                scoreDtos.add(new OptionScoreDto(
                        os.getId(),
                        os.getOption() != null ? os.getOption().getId() : null,
                        os.getOption() != null ? os.getOption().getLabel() : null,
                        f.getId(),
                        f.getName(),
                        os.getScore()
                ));
            }
        }

        Long communityId = decision.getCommunity() != null ? decision.getCommunity().getId() : null;
        String communityName = decision.getCommunity() != null ? decision.getCommunity().getName() : null;

        DecisionResponse response = new DecisionResponse(
                decision.getId(),
                decision.getTitle(),
                decision.getDescription(),
                decision.getVisibility(),
                decision.getStatus() != null ? decision.getStatus() : "OPEN",
                decision.getIsDeleted(),
                decision.getCreatedAt(),
                userService.mapToUserResponse(decision.getOwner()),
                decision.getCategory() != null ? decision.getCategory().getId() : null,
                decision.getCategory() != null ? decision.getCategory().getName() : null,
                communityId,
                communityName,
                pollResponses
        );

        response.setAutoClose(decision.getAutoClose());
        response.setEndsAt(decision.getEndsAt());
        if (decision.getWinningOption() != null) {
            response.setWinningOptionId(decision.getWinningOption().getId());
            response.setWinningOptionLabel(decision.getWinningOption().getLabel());
        }

        response.setOptions(allOptions);
        response.setComparisonFactors(factorDtos);
        response.setOptionScores(scoreDtos);

        return response;
    }
}
