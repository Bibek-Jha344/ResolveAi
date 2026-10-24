package com.resolveai.service;

import com.resolveai.dto.AiChatRequest;
import com.resolveai.dto.AiChatResponse;
import com.resolveai.dto.RagCitationDto;
import com.resolveai.model.DocumentChunk;
import com.resolveai.repository.DocumentChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final DocumentChunkRepository chunkRepository;
    private final EmbeddingProvider embeddingProvider;
    private final LlmProvider llmProvider;
    private final double similarityThreshold;
    private final int maxCitations;

    public AiService(
            DocumentChunkRepository chunkRepository,
            EmbeddingProvider embeddingProvider,
            LlmProvider llmProvider,
            @Value("${resolveai.ai.similarity-threshold:0.35}") double similarityThreshold,
            @Value("${resolveai.ai.max-citations:3}") int maxCitations
    ) {
        this.chunkRepository = chunkRepository;
        this.embeddingProvider = embeddingProvider;
        this.llmProvider = llmProvider;
        this.similarityThreshold = similarityThreshold;
        this.maxCitations = maxCitations;
    }

    private static class ChunkScore {
        final DocumentChunk chunk;
        final double score;

        ChunkScore(DocumentChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }
    }

    @Transactional(readOnly = true)
    public AiChatResponse processChatQuery(AiChatRequest request) {
        String query = request.message().trim();
        List<DocumentChunk> allChunks = chunkRepository.findAllIndexedChunks();

        if (allChunks.isEmpty()) {
            return new AiChatResponse(
                    "The knowledge base currently has no indexed documents. Please upload product documentation or guides to enable grounded AI responses.",
                    Collections.emptyList(),
                    0.0,
                    !llmProvider.isConfigured(),
                    llmProvider.getProviderName()
            );
        }

        // Calculate cosine similarity for all indexed chunks
        List<ChunkScore> scoredChunks = new ArrayList<>();
        for (DocumentChunk chunk : allChunks) {
            double similarity = embeddingProvider.calculateCosineSimilarity(query, chunk.getContent());
            if (similarity > 0.05) { // broad candidate filter
                scoredChunks.add(new ChunkScore(chunk, similarity));
            }
        }

        // Sort descending by relevance score
        scoredChunks.sort((a, b) -> Double.compare(b.score, a.score));

        // Select top chunks
        List<ChunkScore> topMatches = scoredChunks.stream()
                .limit(maxCitations)
                .filter(cs -> cs.score >= similarityThreshold)
                .toList();

        // If no matches exceeded threshold but there are candidate chunks with keyword overlap
        if (topMatches.isEmpty() && !scoredChunks.isEmpty() && scoredChunks.get(0).score > 0.15) {
            topMatches = List.of(scoredChunks.get(0));
        }

        if (topMatches.isEmpty()) {
            return new AiChatResponse(
                    "I searched the knowledge base but could not find information directly addressing your query. You can ask an agent for help or verify your keywords.",
                    Collections.emptyList(),
                    0.1,
                    !llmProvider.isConfigured(),
                    llmProvider.getProviderName()
            );
        }

        // Build verifiable citations
        List<RagCitationDto> citations = new ArrayList<>();
        List<String> contextSnippets = new ArrayList<>();

        for (ChunkScore match : topMatches) {
            String docTitle = match.chunk.getDocument() != null ? match.chunk.getDocument().getTitle() : "Internal Document";
            String docId = match.chunk.getDocument() != null ? match.chunk.getDocument().getId() : "";

            String snippet = match.chunk.getContent();
            if (snippet.length() > 220) {
                snippet = snippet.substring(0, 220) + "...";
            }

            citations.add(new RagCitationDto(
                    docId,
                    docTitle,
                    match.chunk.getId(),
                    snippet,
                    Math.round(match.score * 1000.0) / 1000.0
            ));
            contextSnippets.add(match.chunk.getContent());
        }

        String systemPrompt = "You are ResolveAI, an accurate AI customer support assistant. Answer the user query strictly using the provided context documents. If the context does not contain the answer, say you do not know. Never invent facts or citations.";

        String answer = llmProvider.generateResponse(systemPrompt, query, contextSnippets);
        double topConfidence = topMatches.get(0).score;

        return new AiChatResponse(
                answer,
                citations,
                Math.min(0.99, Math.round(topConfidence * 100.0) / 100.0),
                !llmProvider.isConfigured(),
                llmProvider.getProviderName()
        );
    }
}
