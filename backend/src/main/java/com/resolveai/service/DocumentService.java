package com.resolveai.service;

import com.resolveai.dto.DocumentChunkDto;
import com.resolveai.dto.DocumentResponseDto;
import com.resolveai.exception.BadRequestException;
import com.resolveai.exception.ResourceNotFoundException;
import com.resolveai.model.DocumentChunk;
import com.resolveai.model.KnowledgeDocument;
import com.resolveai.repository.DocumentChunkRepository;
import com.resolveai.repository.KnowledgeDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final KnowledgeDocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final EmbeddingProvider embeddingProvider;

    public DocumentService(
            KnowledgeDocumentRepository documentRepository,
            DocumentChunkRepository chunkRepository,
            EmbeddingProvider embeddingProvider
    ) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.embeddingProvider = embeddingProvider;
    }

    @Transactional(readOnly = true)
    public List<DocumentResponseDto> getAllDocuments() {
        return documentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(DocumentResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentChunkDto> getDocumentChunks(String documentId) {
        if (!documentRepository.existsById(documentId)) {
            throw new ResourceNotFoundException("Document not found with id: " + documentId);
        }
        return chunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId).stream()
                .map(DocumentChunkDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponseDto uploadAndIndexDocument(MultipartFile file, String title) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty.");
        }

        // Limit file size to 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 10MB limit.");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.txt";
        String extension = getFileExtension(originalFilename).toLowerCase();

        if (!List.of("txt", "md", "pdf", "csv", "json").contains(extension)) {
            throw new BadRequestException("Unsupported file type ." + extension + ". Allowed: .txt, .md, .pdf, .csv, .json");
        }

        String rawContent = extractTextContent(file);
        if (rawContent.isBlank()) {
            throw new BadRequestException("Extracted document content is empty or unreadable.");
        }

        KnowledgeDocument doc = new KnowledgeDocument(
                title.trim(),
                originalFilename,
                file.getSize(),
                file.getContentType() != null ? file.getContentType() : "text/plain"
        );
        doc = documentRepository.save(doc);

        List<String> textChunks = splitIntoSlidingChunks(rawContent, 600, 100);
        List<DocumentChunk> chunkEntities = new ArrayList<>();

        for (int i = 0; i < textChunks.size(); i++) {
            String chunkText = textChunks.get(i);
            double[] vector = embeddingProvider.generateEmbedding(chunkText);
            String vectorStr = Arrays.toString(vector);

            DocumentChunk chunk = new DocumentChunk(doc, i, chunkText, vectorStr);
            chunkEntities.add(chunk);
        }

        chunkRepository.saveAll(chunkEntities);

        doc.setChunkCount(chunkEntities.size());
        doc.setStatus("INDEXED");
        doc = documentRepository.save(doc);

        log.info("Successfully ingested document '{}' (id: {}) with {} vector chunks", doc.getTitle(), doc.getId(), doc.getChunkCount());
        return DocumentResponseDto.fromEntity(doc);
    }

    @Transactional
    public void deleteDocument(String id) {
        KnowledgeDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        documentRepository.delete(doc);
    }

    /**
     * Sliding window chunking algorithm: splits text into overlapping windows with sentence boundary awareness.
     */
    public List<String> splitIntoSlidingChunks(String text, int targetChunkChars, int overlapChars) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) return chunks;

        String normalized = text.replace("\r\n", "\n").replaceAll("[\\t ]+", " ");
        int length = normalized.length();

        if (length <= targetChunkChars) {
            chunks.add(normalized.trim());
            return chunks;
        }

        int start = 0;
        while (start < length) {
            int end = Math.min(start + targetChunkChars, length);

            // Attempt to break at the nearest sentence or paragraph boundary
            if (end < length) {
                int boundary = findSentenceBoundary(normalized, end, start);
                if (boundary > start + (targetChunkChars / 2)) {
                    end = boundary;
                }
            }

            String chunk = normalized.substring(start, end).trim();
            if (!chunk.isBlank()) {
                chunks.add(chunk);
            }

            if (end >= length) break;
            start = Math.max(start + 1, end - overlapChars);
        }

        return chunks;
    }

    private int findSentenceBoundary(String text, int end, int minStart) {
        for (int i = end; i > minStart; i--) {
            char c = text.charAt(i - 1);
            if (c == '\n' || c == '.' || c == '?' || c == '!') {
                return i;
            }
        }
        return end;
    }

    private String extractTextContent(MultipartFile file) {
        try {
            // Read stream as UTF-8 plaintext / markdown
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                return reader.lines().collect(Collectors.joining("\n"));
            }
        } catch (Exception e) {
            log.error("Failed to extract text from file: " + file.getOriginalFilename(), e);
            throw new BadRequestException("Could not read uploaded document: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return (idx > 0 && idx < filename.length() - 1) ? filename.substring(idx + 1) : "";
    }
}
