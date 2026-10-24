package com.resolveai.repository;

import com.resolveai.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, String> {
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
    List<TicketComment> findByTicketIdAndIsInternalFalseOrderByCreatedAtAsc(String ticketId);
}
