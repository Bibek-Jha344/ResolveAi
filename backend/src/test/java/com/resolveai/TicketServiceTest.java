package com.resolveai;

import com.resolveai.dto.AddCommentRequest;
import com.resolveai.dto.TicketResponseDto;
import com.resolveai.dto.UpdateTicketRequest;
import com.resolveai.model.*;
import com.resolveai.repository.TicketCommentRepository;
import com.resolveai.repository.TicketRepository;
import com.resolveai.repository.UserRepository;
import com.resolveai.security.UserPrincipal;
import com.resolveai.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketCommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    private TicketService ticketService;

    private User customer1;
    private User customer2;
    private User agent;
    private Ticket ticket1;

    @BeforeEach
    void setUp() {
        ticketService = new TicketService(ticketRepository, commentRepository, userRepository);

        customer1 = new User("Alex Mercer", "alex@example.com", "hash", Role.CUSTOMER);
        customer1.setId("cust-01");

        customer2 = new User("Bob Vance", "bob@example.com", "hash", Role.CUSTOMER);
        customer2.setId("cust-02");

        agent = new User("Sarah Jenkins", "sarah@example.com", "hash", Role.AGENT);
        agent.setId("agent-01");

        ticket1 = new Ticket("Network timeout", "Connection drops intermittently", TicketPriority.HIGH, "Network", customer1);
        ticket1.setId("tkt-01");
    }

    @Test
    @DisplayName("Customer cannot access another customer's ticket")
    void testCustomerCannotAccessOtherTicket() {
        when(ticketRepository.findById("tkt-01")).thenReturn(Optional.of(ticket1));
        UserPrincipal customer2Principal = UserPrincipal.create(customer2);

        assertThrows(AccessDeniedException.class, () -> ticketService.getTicketById("tkt-01", customer2Principal));
    }

    @Test
    @DisplayName("Customer can access their own ticket")
    void testCustomerCanAccessOwnTicket() {
        when(ticketRepository.findById("tkt-01")).thenReturn(Optional.of(ticket1));
        when(commentRepository.findByTicketIdAndIsInternalFalseOrderByCreatedAtAsc("tkt-01")).thenReturn(Collections.emptyList());
        UserPrincipal customer1Principal = UserPrincipal.create(customer1);

        TicketResponseDto dto = ticketService.getTicketById("tkt-01", customer1Principal);
        assertNotNull(dto);
        assertEquals("tkt-01", dto.id());
    }

    @Test
    @DisplayName("Customer cannot post internal staff notes")
    void testCustomerCannotPostInternalNote() {
        when(ticketRepository.findById("tkt-01")).thenReturn(Optional.of(ticket1));
        UserPrincipal customer1Principal = UserPrincipal.create(customer1);
        AddCommentRequest req = new AddCommentRequest("Internal note attempt", true);

        assertThrows(AccessDeniedException.class, () -> ticketService.addComment("tkt-01", req, customer1Principal));
    }

    @Test
    @DisplayName("Agent can post internal staff notes")
    void testAgentCanPostInternalNote() {
        when(ticketRepository.findById("tkt-01")).thenReturn(Optional.of(ticket1));
        when(userRepository.findById("agent-01")).thenReturn(Optional.of(agent));
        UserPrincipal agentPrincipal = UserPrincipal.create(agent);
        AddCommentRequest req = new AddCommentRequest("Confirmed server route issue", true);

        TicketComment saved = new TicketComment(ticket1, agent, req.content(), true);
        when(commentRepository.save(any(TicketComment.class))).thenReturn(saved);

        var resp = ticketService.addComment("tkt-01", req, agentPrincipal);
        assertNotNull(resp);
        assertTrue(resp.isInternal());
    }

    @Test
    @DisplayName("Agent can update ticket status and priority")
    void testAgentCanUpdateStatusAndPriority() {
        when(ticketRepository.findById("tkt-01")).thenReturn(Optional.of(ticket1));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(commentRepository.findByTicketIdOrderByCreatedAtAsc("tkt-01")).thenReturn(Collections.emptyList());

        UserPrincipal agentPrincipal = UserPrincipal.create(agent);
        UpdateTicketRequest updateReq = new UpdateTicketRequest(TicketStatus.IN_PROGRESS, TicketPriority.URGENT, null, null);

        TicketResponseDto updated = ticketService.updateTicket("tkt-01", updateReq, agentPrincipal);
        assertEquals(TicketStatus.IN_PROGRESS, updated.status());
        assertEquals(TicketPriority.URGENT, updated.priority());
    }
}
