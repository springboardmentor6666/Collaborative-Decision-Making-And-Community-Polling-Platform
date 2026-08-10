package com.decisionhub.backend.service.impl;

import com.decisionhub.backend.dto.OptionRequest;
import com.decisionhub.backend.dto.OptionResponse;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.service.OptionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OptionServiceImpl implements OptionService {

    private final OptionRepository optionRepository;
    private final DecisionRepository decisionRepository;

    public OptionServiceImpl(OptionRepository optionRepository,
                             DecisionRepository decisionRepository) {
        this.optionRepository = optionRepository;
        this.decisionRepository = decisionRepository;
    }

    @Override
    public OptionResponse createOption(OptionRequest request) {

        Decision decision = decisionRepository.findById(request.getDecisionId())
                .orElseThrow(() -> new RuntimeException("Decision not found"));

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

        optionRepository.delete(option);
    }
}