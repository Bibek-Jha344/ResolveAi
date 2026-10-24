package com.resolveai.dto;

import com.resolveai.model.TicketPriority;
import com.resolveai.model.TicketStatus;

import java.util.List;
import java.util.Map;

public record AnalyticsSummaryDto(
    long totalTickets,
    long openTickets,
    long inProgressTickets,
    long resolvedTickets,
    long closedTickets,
    double avgResolutionTimeHours,
    long urgentTickets,
    Map<TicketStatus, Long> statusBreakdown,
    Map<TicketPriority, Long> priorityBreakdown,
    List<TicketDailyCount> ticketsByDay,
    double csatScore,
    int aiDeflectionRate
) {
    public record TicketDailyCount(String date, long count) {}
}
