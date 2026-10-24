package com.resolveai;

import com.resolveai.dto.AuthRequest;
import com.resolveai.dto.AuthResponse;
import com.resolveai.dto.RegisterRequest;
import com.resolveai.exception.BadRequestException;
import com.resolveai.model.Role;
import com.resolveai.model.User;
import com.resolveai.repository.UserRepository;
import com.resolveai.security.JwtTokenProvider;
import com.resolveai.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, tokenProvider);
    }

    @Test
    @DisplayName("Registration throws BadRequestException when email already exists")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest("Test User", "exist@example.com", "secret123", "CUSTOMER");
        when(userRepository.existsByEmail("exist@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Registration saves user and issues JWT token")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest("Jane Smith", "jane@example.com", "pass123", "CUSTOMER");
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("hashedPass");

        User savedUser = new User("Jane Smith", "jane@example.com", "hashedPass", Role.CUSTOMER);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateToken(any())).thenReturn("mock-jwt-token");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("mock-jwt-token", resp.token());
        assertEquals("jane@example.com", resp.user().email());
        assertEquals(Role.CUSTOMER, resp.user().role());
    }

    @Test
    @DisplayName("Login throws BadCredentialsException on password mismatch")
    void testLoginBadPassword() {
        AuthRequest req = new AuthRequest("user@example.com", "wrongpass");
        User user = new User("User", "user@example.com", "hashedPass", Role.CUSTOMER);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "hashedPass")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Login succeeds with valid credentials")
    void testLoginSuccess() {
        AuthRequest req = new AuthRequest("admin@resolveai.io", "admin123");
        User user = new User("Admin", "admin@resolveai.io", "hashedPass", Role.ADMIN);

        when(userRepository.findByEmail("admin@resolveai.io")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("admin123", "hashedPass")).thenReturn(true);
        when(tokenProvider.generateToken(any())).thenReturn("admin-jwt");

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("admin-jwt", resp.token());
        assertEquals("admin@resolveai.io", resp.user().email());
        assertEquals(Role.ADMIN, resp.user().role());
    }
}
