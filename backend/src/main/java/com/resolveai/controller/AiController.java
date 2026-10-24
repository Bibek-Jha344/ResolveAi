package com.resolveai.controller;

import com.resolveai.dto.AiChatRequest;
import com.resolveai.dto.AiChatResponse;
import com.resolveai.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Copilot", description = "RAG retrieval and grounded generation from internal documents")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    @Operation(summary = "Ask a customer support or documentation question with grounded citations")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiService.processChatQuery(request);
        return ResponseEntity.ok(response);
    }
}
