package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.DecisionRequest;
import com.decisionhub.backend.entity.Decision;
import com.decisionhub.backend.entity.Option;
import com.decisionhub.backend.repository.DecisionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DecisionService {

    @Autowired
    private DecisionRepository decisionRepository;

    // CREATE DECISION
    public String createDecision(DecisionRequest request) {

        Decision decision = new Decision();
        decision.setTitle(request.getTitle());
        decision.setDescription(request.getDescription());
        decision.setCategory(request.getCategory());
        decision.setVisibility(request.getVisibility());
        decision.setDeadline(request.getDeadline());
        decision.setAnonymous(request.isAnonymous());

        for (String optionName : request.getOptions()) {

            Option option = new Option();
            option.setOptionName(optionName);

            option.setDecision(decision);

            decision.getOptions().add(option);
        }

        decisionRepository.save(decision);

        return "Decision Created Successfully";
    }

    // GET ALL DECISIONS
    public List<Decision> getAllDecisions() {
        return decisionRepository.findAll();
    }

    // GET DECISION BY ID
    public Decision getDecisionById(Long id) {
        return decisionRepository.findById(id).orElse(null);
    }

    // DELETE DECISION
    public String deleteDecision(Long id) {

        if (!decisionRepository.existsById(id)) {
            return "Decision Not Found";
        }

        decisionRepository.deleteById(id);

        return "Decision Deleted Successfully";
    }

}