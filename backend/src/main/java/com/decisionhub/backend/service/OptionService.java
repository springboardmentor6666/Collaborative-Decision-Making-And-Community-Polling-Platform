package com.decisionhub.backend.service;

import com.decisionhub.backend.dto.OptionRequest;
import com.decisionhub.backend.dto.OptionResponse;

import java.util.List;

public interface OptionService {

    OptionResponse createOption(OptionRequest request);

    List<OptionResponse> getOptionsByDecision(Long decisionId);

    OptionResponse updateOption(Long id, OptionRequest request);

    void deleteOption(Long id);
}