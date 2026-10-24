package com.resolveai.dto;

import com.resolveai.model.Ticket;
import com.resolveai.model.TicketPriority;
import com.resolveai.model.TicketStatus;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

public record TicketResponseDto(
    String id,
    String title,
    String description,
    TicketStatus status,
    TicketPriority priority,
    String category,
    String customerId,
    String customerName,
    String customerEmail,
    String assignedToId,
    String assignedToName,
    Instant createdAt,
    Instant updatedAt,
    int commentsCount,
    List<CommentResponseDto> comments
) {
    public static TicketResponseDto fromEntity(Ticket ticket, List<CommentResponseDto> comments) {
        if (ticket == null) return null;
        return new TicketResponseDto(
            ticket.getId(),
            ticket.getTitle(),
            ticket.getDescription(),
            ticket.getStatus(),
            ticket.getPriority(),
            ticket.getCategory(),
            ticket.getCustomer() != null ? ticket.getCustomer().getId() : null,
            ticket.getCustomer() != null ? ticket.getCustomer().getName() : "Unknown",
            ticket.getCustomer() != null ? ticket.getCustomer().getEmail() : "",
            ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null,
            ticket.getAssignedTo() != null ? ticket.getAssignedTo().getName() : null,
            ticket.getCreatedAt(),
            ticket.getUpdatedAt(),
            comments != null ? comments.size() : (ticket.getComments() != null ? ticket.getComments().size() : 0),
            comments != null ? comments : Collections.emptyList()
        );
    }
}
