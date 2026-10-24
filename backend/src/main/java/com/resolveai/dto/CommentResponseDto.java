package com.resolveai.dto;

import com.resolveai.model.Role;
import com.resolveai.model.Ticket;
import com.resolveai.model.TicketComment;
import com.resolveai.model.TicketPriority;
import com.resolveai.model.TicketStatus;

import java.time.Instant;
import java.util.List;

public record CommentResponseDto(
    String id,
    String ticketId,
    String authorId,
    String authorName,
    Role authorRole,
    String content,
    boolean isInternal,
    Instant createdAt
) {
    public static CommentResponseDto fromEntity(TicketComment comment) {
        if (comment == null) return null;
        return new CommentResponseDto(
            comment.getId(),
            comment.getTicket().getId(),
            comment.getAuthor().getId(),
            comment.getAuthor().getName(),
            comment.getAuthor().getRole(),
            comment.getContent(),
            comment.isInternal(),
            comment.getCreatedAt()
        );
    }
}
