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

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteCommunity(id);
        return "Community Deleted Successfully";
    }
}
