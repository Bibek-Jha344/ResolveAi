package com.resolveai.service;

public interface EmbeddingProvider {
    double[] generateEmbedding(String text);
    double calculateCosineSimilarity(double[] vecA, double[] vecB);
    double calculateCosineSimilarity(String textA, String textB);
}
