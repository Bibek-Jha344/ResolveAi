package com.resolveai.repository;

import com.resolveai.model.Ticket;
import com.resolveai.model.TicketPriority;
import com.resolveai.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {

    List<Ticket> findAllByOrderByCreatedAtDesc();

    List<Ticket> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(String assignedToId);

    long countByStatus(TicketStatus status);

    long countByPriority(TicketPriority priority);

    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.createdAt DESC")
    List<Ticket> searchTickets(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("search") String search
    );

    @Query("SELECT t FROM Ticket t WHERE t.customer.id = :customerId AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.createdAt DESC")
    List<Ticket> searchCustomerTickets(
            @Param("customerId") String customerId,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("search") String search
    );
}
