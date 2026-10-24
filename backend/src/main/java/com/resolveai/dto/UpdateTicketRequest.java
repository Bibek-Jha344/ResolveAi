package com.resolveai.dto;

import com.resolveai.model.TicketPriority;
import com.resolveai.model.TicketStatus;

public record UpdateTicketRequest(
    TicketStatus status,
    TicketPriority priority,
    String assignedToId,
    String category
) {}
