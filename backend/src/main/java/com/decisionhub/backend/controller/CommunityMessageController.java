package com.decisionhub.backend.controller;

import com.decisionhub.backend.dto.CommunityMessageRequest;
import com.decisionhub.backend.dto.CommunityMessageResponse;
import com.decisionhub.backend.service.CommunityMessageService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities/{communityId}/messages")
public class CommunityMessageController {
    private final CommunityMessageService service;

    public CommunityMessageController(CommunityMessageService service) {
        this.service = service;
    }

    @GetMapping
    public List<CommunityMessageResponse> list(@PathVariable Long communityId) {
        return service.list(communityId);
    }

    @PostMapping
    public CommunityMessageResponse add(@PathVariable Long communityId, @Valid @RequestBody CommunityMessageRequest request) {
        return service.add(communityId, request);
    }

    @DeleteMapping("/{messageId}")
    public void delete(@PathVariable Long messageId) {
        service.delete(messageId);
    }
}
