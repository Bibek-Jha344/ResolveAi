package com.resolveai.service;

import java.util.List;

public interface LlmProvider {
    String generateResponse(String systemPrompt, String userMessage, List<String> retrievedContext);
    boolean isConfigured();
    String getProviderName();
}
