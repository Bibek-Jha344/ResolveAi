package com.resolveai.dto;

import com.resolveai.model.KnowledgeDocument;

import java.time.Instant;

public record DocumentResponseDto(
    String id,
    String title,
    String fileName,
    Long fileSize,
    String contentType,
    String status,
    Integer chunkCount,
    String errorMessage,
    Instant createdAt,
    Instant updatedAt
) {
    public static DocumentResponseDto fromEntity(KnowledgeDocument doc) {
        if (doc == null) return null;
        return new DocumentResponseDto(
            doc.getId(),
            doc.getTitle(),
            doc.getFileName(),
            doc.getFileSize(),
            doc.getContentType(),
            doc.getStatus(),
            doc.getChunkCount(),
            doc.getErrorMessage(),
            doc.getCreatedAt(),
            doc.getUpdatedAt()
        );
    }
}
