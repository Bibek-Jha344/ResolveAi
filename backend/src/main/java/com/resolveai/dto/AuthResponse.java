package com.resolveai.dto;

public record AuthResponse(
    String token,
    UserDto user
) {}
