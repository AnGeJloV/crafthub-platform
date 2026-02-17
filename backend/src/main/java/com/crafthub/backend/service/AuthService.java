package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.RegisterRequest;
import com.crafthub.backend.model.Role;
import com.crafthub.backend.model.User;
import com.crafthub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    public void register(RegisterRequest request){
        if (userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new IllegalStateException("Пользователь с электронной почтой уже существует");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(user);
    }
}
