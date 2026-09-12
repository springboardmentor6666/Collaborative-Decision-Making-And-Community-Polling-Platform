package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.OptionDTO;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OptionService {

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private VoteRepository voteRepository;

    public List<OptionDTO> getOptionsByDecisionId(Long decisionId) {
        return optionRepository.findByDecisionId(decisionId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OptionDTO addOption(Long decisionId, OptionDTO dto) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new RuntimeException("Decision not found: " + decisionId));

        Option option = new Option();
        option.setDecision(decision);
        option.setOptionTitle(dto.getOptionTitle());
        option.setDescription(dto.getDescription());
        option.setPros(dto.getPros());
        option.setCons(dto.getCons());
        option.setScore(dto.getScore() != null ? dto.getScore() : 0);

        Option saved = optionRepository.save(option);
        return convertToDTO(saved);
    }

    public OptionDTO updateOption(Long optionId, OptionDTO dto) {
        Option option = optionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option not found: " + optionId));

        if (dto.getOptionTitle() != null) option.setOptionTitle(dto.getOptionTitle());
        if (dto.getDescription() != null) option.setDescription(dto.getDescription());
        if (dto.getPros() != null) option.setPros(dto.getPros());
        if (dto.getCons() != null) option.setCons(dto.getCons());
        if (dto.getScore() != null) option.setScore(dto.getScore());
        if (dto.getRanking() != null) option.setRanking(dto.getRanking());

        Option updated = optionRepository.save(option);
        return convertToDTO(updated);
    }

    public void deleteOption(Long optionId) {
        optionRepository.deleteById(optionId);
    }

    private OptionDTO convertToDTO(Option option) {
        long votes = voteRepository.countByOptionId(option.getId());
        return new OptionDTO(
                option.getId(),
                option.getDecision().getId(),
                option.getOptionTitle(),
                option.getDescription(),
                option.getPros(),
                option.getCons(),
                option.getScore(),
                option.getRanking(),
                votes
        );
    }
}
