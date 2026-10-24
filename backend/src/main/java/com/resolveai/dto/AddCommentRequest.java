package com.resolveai.dto;

import jakarta.validation.constraints.NotBlank;

public record AddCommentRequest(
    @NotBlank(message = "Comment text is required")
    String content,

    Boolean isInternal
) {}
