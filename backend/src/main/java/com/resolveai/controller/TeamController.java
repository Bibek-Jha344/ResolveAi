package com.resolveai.controller;

import com.resolveai.dto.UserDto;
import com.resolveai.exception.BadRequestException;
import com.resolveai.exception.ResourceNotFoundException;
import com.resolveai.model.Role;
import com.resolveai.model.User;
import com.resolveai.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/team")
@Tag(name = "Team Management", description = "Member directory and role administration")
public class TeamController {

    private final UserRepository userRepository;

    public TeamController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    @Operation(summary = "Get list of all users and team members")
    public ResponseEntity<List<UserDto>> getTeamMembers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a user's role (Admin only)")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> payload
    ) {
        String roleStr = payload.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            throw new BadRequestException("Role parameter is required.");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleStr.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + roleStr + ". Valid roles are: CUSTOMER, AGENT, ADMIN.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setRole(newRole);
        user = userRepository.save(user);

        return ResponseEntity.ok(UserDto.fromEntity(user));
    }
}
