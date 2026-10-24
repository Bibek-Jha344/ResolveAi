package com.resolveai.dto;

public record RagCitationDto(
    String documentId,
    String documentTitle,
    String chunkId,
    String snippet,
    double relevanceScore
) {}
