package com.resolveai.service;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DefaultEmbeddingProvider implements EmbeddingProvider {

    @Override
    public double[] generateEmbedding(String text) {
        // Fallback normalized frequency vector across common vocabulary hash spaces
        final int DIM = 128;
        double[] vector = new double[DIM];
        if (text == null || text.isBlank()) return vector;

        String[] tokens = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+");
        for (String token : tokens) {
            if (token.isBlank()) continue;
            int hash = Math.abs(token.hashCode()) % DIM;
            vector[hash] += 1.0;
        }

        // L2 normalize
        double sumSq = 0.0;
        for (double v : vector) {
            sumSq += v * v;
        }
        if (sumSq > 0) {
            double norm = Math.sqrt(sumSq);
            for (int i = 0; i < DIM; i++) {
                vector[i] /= norm;
            }
        }
        return vector;
    }

    @Override
    public double calculateCosineSimilarity(double[] vecA, double[] vecB) {
        if (vecA == null || vecB == null || vecA.length != vecB.length) return 0.0;

        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    @Override
    public double calculateCosineSimilarity(String textA, String textB) {
        if (textA == null || textB == null) return 0.0;

        Map<String, Integer> freqA = getTermFrequencies(textA);
        Map<String, Integer> freqB = getTermFrequencies(textB);

        Set<String> allTerms = new HashSet<>();
        allTerms.addAll(freqA.keySet());
        allTerms.addAll(freqB.keySet());

        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (String term : allTerms) {
            double countA = freqA.getOrDefault(term, 0);
            double countB = freqB.getOrDefault(term, 0);

            // Logarithmic term weighting
            double weightA = countA > 0 ? (1.0 + Math.log(countA)) : 0.0;
            double weightB = countB > 0 ? (1.0 + Math.log(countB)) : 0.0;

            dot += weightA * weightB;
            normA += weightA * weightA;
            normB += weightB * weightB;
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private Map<String, Integer> getTermFrequencies(String text) {
        Map<String, Integer> map = new HashMap<>();
        String cleaned = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        String[] words = cleaned.split("\\s+");

        for (String word : words) {
            if (word.length() < 2) continue;
            map.put(word, map.getOrDefault(word, 0) + 1);

            // Also add character 3-grams for typo & stem matching
            if (word.length() >= 3) {
                for (int i = 0; i <= word.length() - 3; i++) {
                    String gram = word.substring(i, i + 3);
                    map.put(gram, map.getOrDefault(gram, 0) + 1);
                }
            }
        }
        return map;
    }
}
