package com.resolveai;

import com.resolveai.repository.DocumentChunkRepository;
import com.resolveai.repository.KnowledgeDocumentRepository;
import com.resolveai.service.DefaultEmbeddingProvider;
import com.resolveai.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class RagChunkingTest {

    @Mock
    private KnowledgeDocumentRepository documentRepository;

    @Mock
    private DocumentChunkRepository chunkRepository;

    private DefaultEmbeddingProvider embeddingProvider;
    private DocumentService documentService;

    @BeforeEach
    void setUp() {
        embeddingProvider = new DefaultEmbeddingProvider();
        documentService = new DocumentService(documentRepository, chunkRepository, embeddingProvider);
    }

    @Test
    @DisplayName("Short text returns single chunk")
    void testShortTextChunk() {
        String text = "ResolveAI provides RAG customer support.";
        List<String> chunks = documentService.splitIntoSlidingChunks(text, 500, 50);

        assertEquals(1, chunks.size());
        assertEquals("ResolveAI provides RAG customer support.", chunks.get(0));
    }

    @Test
    @DisplayName("Sliding window chunks long text with overlap")
    void testLongTextChunking() {
        StringBuilder longDoc = new StringBuilder();
        for (int i = 1; i <= 20; i++) {
            longDoc.append("Section ").append(i).append(": ResolveAI is designed for enterprise customer support automation and grounded vector search. ");
        }

        List<String> chunks = documentService.splitIntoSlidingChunks(longDoc.toString(), 250, 50);

        assertTrue(chunks.size() > 1, "Should produce multiple chunks for long document");
        for (String chunk : chunks) {
            assertFalse(chunk.isBlank());
            assertTrue(chunk.length() <= 350, "Chunk should respect approximate window size");
        }
    }

    @Test
    @DisplayName("Cosine similarity returns 1.0 for identical text and low for orthogonal text")
    void testCosineSimilarityAccuracy() {
        String text1 = "PostgreSQL pgvector cosine distance index configuration";
        String text2 = "PostgreSQL pgvector cosine distance index configuration";
        String unrelated = "Banana smoothie recipe with fresh organic strawberries";

        double identicalScore = embeddingProvider.calculateCosineSimilarity(text1, text2);
        double unrelatedScore = embeddingProvider.calculateCosineSimilarity(text1, unrelated);

        assertEquals(1.0, identicalScore, 0.001, "Identical text must yield cosine similarity 1.0");
        assertTrue(unrelatedScore < 0.2, "Unrelated text must yield low cosine score");
    }
}
