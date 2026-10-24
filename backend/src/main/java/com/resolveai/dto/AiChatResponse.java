package com.resolveai.dto;

import java.util.List;

public record AiChatResponse(
    String answer,
    List<RagCitationDto> citations,
    double confidence,
    boolean isFallback,
    String modelUsed
) {}
