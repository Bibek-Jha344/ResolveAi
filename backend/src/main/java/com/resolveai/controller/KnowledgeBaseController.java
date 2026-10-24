package com.resolveai.controller;

import com.resolveai.dto.DocumentChunkDto;
import com.resolveai.dto.DocumentResponseDto;
import com.resolveai.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@Tag(name = "Knowledge Base", description = "Document upload, parsing, vector chunk inspection, and indexing")
public class KnowledgeBaseController {

    private final DocumentService documentService;

    public KnowledgeBaseController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    @Operation(summary = "List all indexed knowledge base documents")
    public ResponseEntity<List<DocumentResponseDto>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/{id}/chunks")
    @Operation(summary = "Get all vector chunks for a specific document")
    public ResponseEntity<List<DocumentChunkDto>> getDocumentChunks(@PathVariable String id) {
        return ResponseEntity.ok(documentService.getDocumentChunks(id));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    @Operation(summary = "Upload and index a document (.txt, .md, .pdf) for RAG retrieval")
    public ResponseEntity<DocumentResponseDto> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title
    ) {
        DocumentResponseDto doc = documentService.uploadAndIndexDocument(file, title);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    @Operation(summary = "Delete document and its vector chunks")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
