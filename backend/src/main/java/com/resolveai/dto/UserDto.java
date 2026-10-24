package com.resolveai.dto;

import com.resolveai.model.Role;
import com.resolveai.model.User;

import java.time.Instant;

public record UserDto(
    String id,
    String name,
    String email,
    Role role,
    String avatarUrl,
    Instant createdAt
) {
    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getAvatarUrl(),
            user.getCreatedAt()
        );
    }
}
