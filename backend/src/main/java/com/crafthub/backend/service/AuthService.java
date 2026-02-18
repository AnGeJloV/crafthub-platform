package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.LoginRequest;
import com.crafthub.backend.dto.request.RegisterRequest;
import com.crafthub.backend.dto.response.LoginResponse;
import com.crafthub.backend.model.Role;
import com.crafthub.backend.model.User;
import com.crafthub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Сервис, отвечающий за бизнес-логику аутентификации и регистрации.
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void register(RegisterRequest request){
        if (userRepository.findByEmail(request.email()).isPresent()){
            throw new IllegalStateException("Пользователь с электронной почтой уже существует");
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        // Аутентификация с помощью Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        // Если аутентификация прошла успешно, ищем пользователя
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Неверный email или пароль"));

        // Генерируем для него JWT-токен
        var jwtToken = jwtService.generateToken(user);

        // Возвращаем токен и данные в виде DTO
        return new LoginResponse(jwtToken, user.getEmail(), user.getFullName(), user.getRole());
    }
}
