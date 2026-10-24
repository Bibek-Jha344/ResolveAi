package com.resolveai.dto;

import jakarta.validation.constraints.NotBlank;

public record AiChatRequest(
    @NotBlank(message = "Query message cannot be blank")
    String message
) {}
