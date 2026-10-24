package com.resolveai.dto;

public record SystemHealthDto(
    String status,
    String database,
    String vectorStore,
    String aiProvider,
    String aiProviderName,
    String version,
    long uptimeSeconds
) {}
