package com.resolveai.repository;

import com.resolveai.model.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, String> {

    List<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(String documentId);

    @Query("SELECT c FROM DocumentChunk c JOIN FETCH c.document d WHERE d.status = 'INDEXED'")
    List<DocumentChunk> findAllIndexedChunks();

    @Query("SELECT c FROM DocumentChunk c JOIN FETCH c.document d WHERE d.status = 'INDEXED' AND LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<DocumentChunk> searchByKeyword(@Param("keyword") String keyword);
}
