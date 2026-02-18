package com.crafthub.backend.config;

import com.crafthub.backend.model.Role;
import com.crafthub.backend.model.User;
import com.crafthub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Класс для инициализации базы данных начальными данными при запуске приложения.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Создаем администратора, если его еще нет
        if (userRepository.findByEmail("admin@crafthub.by").isEmpty()) {
            User admin = User.builder()
                    .fullName("Главный Администратор")
                    .email("admin@crafthub.by")
                    .password(passwordEncoder.encode("adminadmin"))
                    .phoneNumber("+375291111111")
                    .role(Role.ROLE_ADMIN)
                    .build();
            userRepository.save(admin);
        }

        // Создаем обычного пользователя для тестов
        if (userRepository.findByEmail("user@crafthub.by").isEmpty()) {
            User user = User.builder()
                    .fullName("Тестовый Покупатель")
                    .email("user@crafthub.by")
                    .password(passwordEncoder.encode("useruser"))
                    .phoneNumber("+375292222222")
                    .role(Role.ROLE_USER)
                    .build();
            userRepository.save(user);
        }
    }
}