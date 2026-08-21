package com.decisionhub.service;

import com.decisionhub.dto.request.NomineeRequest;
import com.decisionhub.dto.response.NomineeResponse;

import java.util.List;

public interface NomineeService {
    NomineeResponse submitNomination(Long categoryId, Long userId, NomineeRequest request);
    NomineeResponse updateNominee(Long nomineeId, Long userId, NomineeRequest request);
    List<NomineeResponse> getNomineesForCategory(Long categoryId, Long userId);
    void approveNomination(Long nomineeId, Long userId);
    void rejectNomination(Long nomineeId, Long userId);
    void deleteNominee(Long nomineeId, Long userId);
}
