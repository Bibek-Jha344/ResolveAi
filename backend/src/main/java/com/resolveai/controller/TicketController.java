package com.resolveai.controller;

import com.resolveai.dto.*;
import com.resolveai.model.TicketPriority;
import com.resolveai.model.TicketStatus;
import com.resolveai.security.UserPrincipal;
import com.resolveai.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@Tag(name = "Tickets", description = "Ticket creation, workflow triage, status updates, and comments")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    @Operation(summary = "List tickets with optional status, priority, and text search")
    public ResponseEntity<List<TicketResponseDto>> getTickets(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String search
    ) {
        List<TicketResponseDto> tickets = ticketService.getTickets(principal, status, priority, search);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single ticket details by ID with conversation comments")
    public ResponseEntity<TicketResponseDto> getTicketById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TicketResponseDto ticket = ticketService.getTicketById(id, principal);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping
    @Operation(summary = "Create a new support ticket")
    public ResponseEntity<TicketResponseDto> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TicketResponseDto created = ticketService.createTicket(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update ticket status, priority, or assignee")
    public ResponseEntity<TicketResponseDto> updateTicket(
            @PathVariable String id,
            @RequestBody UpdateTicketRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TicketResponseDto updated = ticketService.updateTicket(id, request, principal);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Post a comment or internal staff note to a ticket")
    public ResponseEntity<CommentResponseDto> addComment(
            @PathVariable String id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        CommentResponseDto comment = ticketService.addComment(id, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }
}
