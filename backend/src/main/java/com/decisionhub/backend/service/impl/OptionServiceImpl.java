package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.OptionRequest;
import com.decisionhub.backend.dto.OptionResponse;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.service.OptionService;
import com.decisionhub.backend.service.CurrentUserService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OptionServiceImpl implements OptionService {

    private final OptionRepository optionRepository;
    private final DecisionRepository decisionRepository;
    private final CurrentUserService currentUser;

    public OptionServiceImpl(OptionRepository optionRepository,
                             DecisionRepository decisionRepository, CurrentUserService currentUser) {
        this.optionRepository = optionRepository;
        this.decisionRepository = decisionRepository;
        this.currentUser = currentUser;
    }

    @Override
    public OptionResponse createOption(OptionRequest request) {

        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new RuntimeException("Decision not found"));
        assertOwner(decision);

        Option option = Option.builder()
                .optionText(request.getOptionText())
                .decision(decision)
                .build();

        Option savedOption = optionRepository.save(option);

        return OptionResponse.builder()
                .id(savedOption.getId())
                .optionText(savedOption.getOptionText())
                .decisionId(savedOption.getDecision().getId())
                .build();
    }

    @Override
    public List<OptionResponse> getOptionsByDecision(Long decisionId) {

        return optionRepository.findByDecisionId(decisionId)
                .stream()
                .map(option -> OptionResponse.builder()
                        .id(option.getId())
                        .optionText(option.getOptionText())
                        .decisionId(option.getDecision().getId())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public OptionResponse updateOption(Long id, OptionRequest request) {

        Option option = optionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Option not found"));
        assertOwner(option.getDecision());

        option.setOptionText(request.getOptionText());

        Option updated = optionRepository.save(option);

        return OptionResponse.builder()
                .id(updated.getId())
                .optionText(updated.getOptionText())
                .decisionId(updated.getDecision().getId())
                .build();
    }

    @Override
    public void deleteOption(Long id) {

        Option option = optionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Option not found"));
        assertOwner(option.getDecision());

        optionRepository.delete(option);
    }

    private void assertOwner(Decision decision) {
        if (!decision.getCreatedBy().getId().equals(currentUser.get().getId())) throw new AccessDeniedException("You can only modify options on your own decision");
    }
}
