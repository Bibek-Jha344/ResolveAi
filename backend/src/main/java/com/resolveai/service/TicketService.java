package com.resolveai.service;

import com.resolveai.dto.*;
import com.resolveai.exception.BadRequestException;
import com.resolveai.exception.ResourceNotFoundException;
import com.resolveai.model.*;
import com.resolveai.repository.TicketCommentRepository;
import com.resolveai.repository.TicketRepository;
import com.resolveai.repository.UserRepository;
import com.resolveai.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, TicketCommentRepository commentRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDto> getTickets(UserPrincipal principal, TicketStatus status, TicketPriority priority, String search) {
        List<Ticket> tickets;

        if (principal.getRole() == Role.CUSTOMER) {
            tickets = ticketRepository.searchCustomerTickets(principal.getId(), status, priority, search);
        } else {
            tickets = ticketRepository.searchTickets(status, priority, search);
        }

        return tickets.stream()
                .map(t -> {
                    List<TicketComment> comments = getVisibleComments(t.getId(), principal);
                    List<CommentResponseDto> commentDtos = comments.stream()
                            .map(CommentResponseDto::fromEntity)
                            .collect(Collectors.toList());
                    return TicketResponseDto.fromEntity(t, commentDtos);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponseDto getTicketById(String id, UserPrincipal principal) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Ownership enforcement for CUSTOMER role
        if (principal.getRole() == Role.CUSTOMER && !ticket.getCustomer().getId().equals(principal.getId())) {
            throw new AccessDeniedException("You do not have access to view this ticket.");
        }

        List<TicketComment> comments = getVisibleComments(ticket.getId(), principal);
        List<CommentResponseDto> commentDtos = comments.stream()
                .map(CommentResponseDto::fromEntity)
                .collect(Collectors.toList());

        return TicketResponseDto.fromEntity(ticket, commentDtos);
    }

    @Transactional
    public TicketResponseDto createTicket(CreateTicketRequest request, UserPrincipal principal) {
        User customer = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        Ticket ticket = new Ticket(
                request.title(),
                request.description(),
                request.priority(),
                request.category(),
                customer
        );

        ticket = ticketRepository.save(ticket);
        return TicketResponseDto.fromEntity(ticket, List.of());
    }

    @Transactional
    public TicketResponseDto updateTicket(String id, UpdateTicketRequest request, UserPrincipal principal) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        boolean isStaff = principal.getRole() == Role.ADMIN || principal.getRole() == Role.AGENT;
        boolean isOwner = ticket.getCustomer().getId().equals(principal.getId());

        if (!isStaff && !isOwner) {
            throw new AccessDeniedException("You do not have permission to modify this ticket.");
        }

        if (request.status() != null) {
            // Customer can only close their own ticket
            if (!isStaff && request.status() != TicketStatus.CLOSED) {
                throw new AccessDeniedException("Customers can only transition ticket to CLOSED status.");
            }
            ticket.setStatus(request.status());
        }

        if (request.priority() != null) {
            if (!isStaff) {
                throw new AccessDeniedException("Only support agents or administrators can change ticket priority.");
            }
            ticket.setPriority(request.priority());
        }

        if (request.assignedToId() != null) {
            if (!isStaff) {
                throw new AccessDeniedException("Only support staff can reassign tickets.");
            }
            if (request.assignedToId().isBlank() || request.assignedToId().equalsIgnoreCase("null")) {
                ticket.setAssignedTo(null);
            } else {
                User assignee = userRepository.findById(request.assignedToId())
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with id: " + request.assignedToId()));
                ticket.setAssignedTo(assignee);
            }
        }

        if (request.category() != null && !request.category().isBlank()) {
            ticket.setCategory(request.category());
        }

        ticket = ticketRepository.save(ticket);
        List<CommentResponseDto> comments = getVisibleComments(ticket.getId(), principal).stream()
                .map(CommentResponseDto::fromEntity)
                .collect(Collectors.toList());

        return TicketResponseDto.fromEntity(ticket, comments);
    }

    @Transactional
    public CommentResponseDto addComment(String ticketId, AddCommentRequest request, UserPrincipal principal) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        boolean isStaff = principal.getRole() == Role.ADMIN || principal.getRole() == Role.AGENT;
        boolean isOwner = ticket.getCustomer().getId().equals(principal.getId());

        if (!isStaff && !isOwner) {
            throw new AccessDeniedException("You do not have permission to comment on this ticket.");
        }

        boolean isInternal = Boolean.TRUE.equals(request.isInternal());
        if (isInternal && !isStaff) {
            throw new AccessDeniedException("Customers cannot post internal staff notes.");
        }

        User author = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Author user not found"));

        TicketComment comment = new TicketComment(ticket, author, request.content(), isInternal);
        comment = commentRepository.save(comment);

        // Update ticket updated_at
        ticket.onUpdate();
        ticketRepository.save(ticket);

        return CommentResponseDto.fromEntity(comment);
    }

    private List<TicketComment> getVisibleComments(String ticketId, UserPrincipal principal) {
        if (principal.getRole() == Role.CUSTOMER) {
            return commentRepository.findByTicketIdAndIsInternalFalseOrderByCreatedAtAsc(ticketId);
        }
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }
}
