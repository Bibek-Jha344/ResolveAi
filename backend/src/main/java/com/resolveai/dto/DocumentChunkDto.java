package com.resolveai.dto;

import com.resolveai.model.DocumentChunk;
import com.resolveai.model.KnowledgeDocument;

import java.time.Instant;

public record DocumentChunkDto(
    String id,
    String documentId,
    Integer chunkIndex,
    String content,
    Instant createdAt
) {
    public static DocumentChunkDto fromEntity(DocumentChunk chunk) {
        if (chunk == null) return null;
        return new DocumentChunkDto(
            chunk.getId(),
            chunk.getDocument() != null ? chunk.getDocument().getId() : null,
            chunk.getChunkIndex(),
            chunk.getContent(),
            chunk.getCreatedAt()
        );
    }
}
