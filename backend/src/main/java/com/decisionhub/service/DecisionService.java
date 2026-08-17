package com.decisionhub.service;

import com.decisionhub.dto.*;
import com.decisionhub.entity.*;
import com.decisionhub.exception.CommunityNotFoundException;
import com.decisionhub.exception.DecisionNotFoundException;
import com.decisionhub.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    private final PollOptionRepository pollOptionRepository;
    private final VoteRepository voteRepository;
    private final ComparisonFactorRepository comparisonFactorRepository;
    private final OptionScoreRepository optionScoreRepository;
    private final UserService userService;

    public DecisionService(DecisionRepository decisionRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           CommunityRepository communityRepository,
                           CommunityMemberRepository communityMemberRepository,
                           PollOptionRepository pollOptionRepository,
                           VoteRepository voteRepository,
                           ComparisonFactorRepository comparisonFactorRepository,
                           OptionScoreRepository optionScoreRepository,
                           UserService userService) {
        this.decisionRepository = decisionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.communityRepository = communityRepository;
        this.communityMemberRepository = communityMemberRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.voteRepository = voteRepository;
        this.comparisonFactorRepository = comparisonFactorRepository;
        this.optionScoreRepository = optionScoreRepository;
        this.userService = userService;
    }

    @Transactional
    public DecisionResponse createDecision(DecisionRequest request, String userEmail) {
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        Decision decision = new Decision();
        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        decision.setOwner(owner);

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

        return mapToDecisionResponse(savedDecision);
    }

    @Transactional(readOnly = true)
    public List<DecisionResponse> getAllDecisions() {
        return decisionRepository.findByIsDeletedFalse().stream()
                .map(this::mapToDecisionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DecisionResponse getDecisionById(Long id) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + id));
        return mapToDecisionResponse(decision);
    }

    @Transactional(readOnly = true)
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

        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        if (request.getVisibility() != null) {
            decision.setVisibility(request.getVisibility());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId()).orElse(null);
            decision.setCategory(category);
        }

        Decision updatedDecision = decisionRepository.save(decision);
        return mapToDecisionResponse(updatedDecision);
    }

    @Transactional
    public void deleteDecision(Long id, String userEmail) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new DecisionNotFoundException("Decision not found with id: " + id));
        // Soft delete
        decision.setIsDeleted(true);
        decisionRepository.save(decision);
    }

    public DecisionResponse mapToDecisionResponse(Decision decision) {
        List<PollResponse> pollResponses = new ArrayList<>();
        List<OptionDto> allOptions = new ArrayList<>();

        if (decision.getPolls() != null) {
            for (Poll poll : decision.getPolls()) {
                List<Vote> pollVotes = voteRepository.findByPollId(poll.getId());
                Map<Long, Long> voteCounts = pollVotes.stream()
                        .collect(Collectors.groupingBy(v -> v.getPollOption().getId(), Collectors.counting()));

                List<OptionDto> optionDtos = new ArrayList<>();
                if (poll.getPollOptions() != null) {
                    optionDtos = poll.getPollOptions().stream()
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
                        poll.getQuestion(),
                        poll.getIsAnonymous(),
                        poll.getEndsAt(),
                        optionDtos
                ));
            }
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
                decision.getIsDeleted(),
                decision.getCreatedAt(),
                userService.mapToUserResponse(decision.getOwner()),
                decision.getCategory() != null ? decision.getCategory().getId() : null,
                decision.getCategory() != null ? decision.getCategory().getName() : null,
                communityId,
                communityName,
                pollResponses
        );

        response.setOptions(allOptions);
        response.setComparisonFactors(factorDtos);
        response.setOptionScores(scoreDtos);

        return response;
    }
}
