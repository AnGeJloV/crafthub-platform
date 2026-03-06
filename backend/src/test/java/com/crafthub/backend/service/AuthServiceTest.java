package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.LoginRequest;
import com.crafthub.backend.dto.request.RegisterRequest;
import com.crafthub.backend.dto.response.LoginResponse;
import com.crafthub.backend.model.Role;
import com.crafthub.backend.model.User;
import com.crafthub.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_ShouldSaveUser_WhenEmailIsUnique() {
        // Arrange (Подготовка)
        RegisterRequest request = new RegisterRequest("test@mail.com", "password", "Test User", "+375291112233");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.password())).thenReturn("encoded_pass");

        // Act (Действие)
        authService.register(request);

        // Assert (Проверка)
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest("exist@mail.com", "password", "User", "123");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(new User()));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        // Arrange
        LoginRequest request = new LoginRequest("test@mail.com", "password");
        User user = User.builder().email("test@mail.com").role(Role.ROLE_USER).build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt_token_example");

        // Act
        LoginResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("jwt_token_example", response.token());
        assertEquals("test@mail.com", response.email());
    }
}