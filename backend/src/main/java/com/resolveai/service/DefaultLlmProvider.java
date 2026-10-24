package com.resolveai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DefaultLlmProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(DefaultLlmProvider.class);

    private final String apiKey;
    private final String model;
    private final String providerName;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public DefaultLlmProvider(
            @Value("${resolveai.ai.api-key:}") String apiKey,
            @Value("${resolveai.ai.model:gpt-4o-mini}") String model,
            @Value("${resolveai.ai.provider:fallback}") String providerName
    ) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null ? model : "gpt-4o-mini";
        this.providerName = providerName;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    @Override
    public String getProviderName() {
        return isConfigured() ? ("OpenAI (" + model + ")") : "Local Grounded Engine (Deterministic RAG)";
    }

    @Override
    public String generateResponse(String systemPrompt, String userMessage, List<String> retrievedContext) {
        if (isConfigured()) {
            try {
                return callOpenAiApi(systemPrompt, userMessage, retrievedContext);
            } catch (Exception e) {
                log.warn("Call to external LLM provider failed, falling back to local grounded synthesis: {}", e.getMessage());
            }
        }

        // Local grounded synthesis when external API key is unconfigured or unavailable
        return synthesizeLocalGroundedResponse(userMessage, retrievedContext);
    }

    private String callOpenAiApi(String systemPrompt, String userMessage, List<String> retrievedContext) throws Exception {
        StringBuilder contextText = new StringBuilder();
        for (int i = 0; i < retrievedContext.size(); i++) {
            contextText.append(String.format("[Context Document #%d]\n%s\n\n", i + 1, retrievedContext.get(i)));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt + "\n\nRetrieved Grounding Documents:\n" + contextText),
                Map.of("role", "user", "content", userMessage)
        ));
        body.put("temperature", 0.2);

        String jsonPayload = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(25))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText();
            }
        }

        log.warn("OpenAI API returned status code {}: {}", response.statusCode(), response.body());
        return synthesizeLocalGroundedResponse(userMessage, retrievedContext);
    }

    private String synthesizeLocalGroundedResponse(String userMessage, List<String> retrievedContext) {
        if (retrievedContext == null || retrievedContext.isEmpty()) {
            return "I could not find relevant documentation in the knowledge base to answer your question with confidence. Please upload relevant guides or contact support tier-2.";
        }

        StringBuilder response = new StringBuilder();
        response.append("Based on the indexed knowledge base documentation:\n\n");

        for (String chunk : retrievedContext) {
            // Trim and present relevant facts
            String trimmed = chunk.trim();
            if (trimmed.length() > 300) {
                trimmed = trimmed.substring(0, 300) + "...";
            }
            response.append("• ").append(trimmed).append("\n\n");
        }

        response.append("For full specifications, refer to the cited document references below.");
        return response.toString();
    }
}
