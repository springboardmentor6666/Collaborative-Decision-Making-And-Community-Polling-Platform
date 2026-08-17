package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.CommunityRequest;
import com.decisionhub.backend.dto.CommunityResponse;
import com.decisionhub.backend.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityService service;

    public CommunityController(CommunityService service) {
        this.service = service;
    }

    @PostMapping
    public CommunityResponse create(@Valid @RequestBody CommunityRequest request) {
        return service.createCommunity(request);
    }

    @GetMapping
    public List<CommunityResponse> getAll() {
        return service.getAllCommunities();
    }
    @GetMapping("/{id}") public CommunityResponse get(@PathVariable Long id) { return service.getCommunity(id); }
    @PostMapping("/{id}/join") public CommunityResponse join(@PathVariable Long id) { return service.join(id); }
    @PostMapping("/{id}/leave") public CommunityResponse leave(@PathVariable Long id) { return service.leave(id); }
    @GetMapping("/{id}/decisions") public List<com.decisionhub.backend.dto.DecisionResponse> decisions(@PathVariable Long id) { return service.getCommunityDecisions(id); }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteCommunity(id);
        return "Community Deleted Successfully";
    }
}
