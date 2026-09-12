package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.DecisionDTO;
import com.decisionhub.backend.dto.OptionDTO;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.entity.User;
import com.decisionhub.backend.repository.DecisionRepository;
import com.decisionhub.backend.repository.OptionRepository;
import com.decisionhub.backend.repository.UserRepository;
import com.decisionhub.backend.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DecisionService {

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VoteRepository voteRepository;

    public List<DecisionDTO> getAllDecisions() {
        return decisionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DecisionDTO> getPublicDecisions() {
        return decisionRepository.findByVisibility("PUBLIC").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DecisionDTO> getDecisionsByCategory(String category) {
        return decisionRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DecisionDTO> getUserDecisions(Long userId) {
        return decisionRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DecisionDTO getDecisionById(Long id) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Decision not found with id: " + id));
        return convertToDTO(decision);
    }

    public DecisionDTO createDecision(DecisionDTO dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Decision decision = new Decision();
        decision.setTitle(dto.getTitle());
        decision.setDescription(dto.getDescription());
        decision.setCategory(dto.getCategory() != null ? dto.getCategory() : "General");
        decision.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        decision.setVisibility(dto.getVisibility() != null ? dto.getVisibility() : "PUBLIC");
        decision.setUser(user);

        Decision saved = decisionRepository.save(decision);

        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            for (OptionDTO optionDTO : dto.getOptions()) {
                Option option = new Option();
                option.setDecision(saved);
                option.setOptionTitle(optionDTO.getOptionTitle());
                option.setDescription(optionDTO.getDescription());
                option.setPros(optionDTO.getPros());
                option.setCons(optionDTO.getCons());
                option.setScore(0);
                optionRepository.save(option);
            }
        }

        return getDecisionById(saved.getId());
    }

    public DecisionDTO updateDecision(Long id, DecisionDTO dto) {
        Decision decision = decisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Decision not found with id: " + id));

        if (dto.getTitle() != null) decision.setTitle(dto.getTitle());
        if (dto.getDescription() != null) decision.setDescription(dto.getDescription());
        if (dto.getCategory() != null) decision.setCategory(dto.getCategory());
        if (dto.getStatus() != null) decision.setStatus(dto.getStatus());
        if (dto.getVisibility() != null) decision.setVisibility(dto.getVisibility());

        Decision updated = decisionRepository.save(decision);
        return convertToDTO(updated);
    }

    public void deleteDecision(Long id) {
        decisionRepository.deleteById(id);
    }

    private DecisionDTO convertToDTO(Decision decision) {
        DecisionDTO dto = new DecisionDTO();
        dto.setId(decision.getId());
        dto.setTitle(decision.getTitle());
        dto.setDescription(decision.getDescription());
        dto.setCategory(decision.getCategory());
        dto.setStatus(decision.getStatus());
        dto.setVisibility(decision.getVisibility());
        dto.setCreatedAt(decision.getCreatedAt());

        if (decision.getUser() != null) {
            dto.setUserId(decision.getUser().getId());
            dto.setUsername(decision.getUser().getUsername());
        }

        List<Option> options = optionRepository.findByDecisionId(decision.getId());
        List<OptionDTO> optionDTOs = new ArrayList<>();
        for (Option opt : options) {
            long voteCount = voteRepository.countByOptionId(opt.getId());
            OptionDTO optDTO = new OptionDTO(
                    opt.getId(),
                    decision.getId(),
                    opt.getOptionTitle(),
                    opt.getDescription(),
                    opt.getPros(),
                    opt.getCons(),
                    opt.getScore(),
                    opt.getRanking(),
                    voteCount
            );
            optionDTOs.add(optDTO);
        }
        dto.setOptions(optionDTOs);
        dto.setTotalVotes(voteRepository.countByDecisionId(decision.getId()));

        return dto;
    }
}
