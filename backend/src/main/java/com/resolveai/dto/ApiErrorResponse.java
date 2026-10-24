package com.resolveai.dto;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
    int status,
    String error,
    String message,
    String path,
    Instant timestamp,
    List<String> validationErrors
) {
    public ApiErrorResponse(int status, String error, String message, String path) {
        this(status, error, message, path, Instant.now(), null);
    }

    public ApiErrorResponse(int status, String error, String message, String path, List<String> validationErrors) {
        this(status, error, message, path, Instant.now(), validationErrors);
    }
}
