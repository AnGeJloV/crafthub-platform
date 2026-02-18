package com.crafthub.backend.service;

import com.crafthub.backend.model.Role;
import com.crafthub.backend.model.User;
import com.crafthub.backend.model.VerificationRequest;
import com.crafthub.backend.model.VerificationStatus;
import com.crafthub.backend.repository.UserRepository;
import com.crafthub.backend.repository.VerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Сервис для управления процессом верификации пользователей.
 */
@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationRequestRepository verificationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    // Создает новую заявку на верификацию
    @Transactional
    public void applyForVerification(String legalInfo, MultipartFile file){

        // Получаем текущего юзера
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));

        // Проверка, нет ли уже активной заявки
        if (verificationRepository.existsByUserIdAndStatus(user.getId(), VerificationStatus.PENDING)){
            throw new IllegalStateException("У вас уже есть заявка на рассмотрении");
        }

        // Сохраняем файл на диск и получаем путь
        String filePath = fileStorageService.saveFile(file);

        // Создаем и сохраняем заявку в БД
        VerificationRequest request = VerificationRequest.builder()
                .user(user)
                .legalInfo(legalInfo)
                .documentUrl(filePath)
                .status(VerificationStatus.PENDING)
                .build();

        verificationRepository.save(request);
    }

    // Возвращает все заявки, ожидающие проверки (для админа)
    public List<VerificationRequest> getPendingRequests() {
        return verificationRepository.findByStatus(VerificationStatus.PENDING);
    }


    // Обрабатывает решение админа по заявке.
    @Transactional
    public void processDecision(Long requestId, VerificationStatus status, String reason) {
        VerificationRequest request = verificationRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Заявка не найдена"));

        if (request.getStatus() != VerificationStatus.PENDING) {
            throw new IllegalStateException("Заявка уже обработана");
        }

        request.setStatus(status);

        if (status == VerificationStatus.APPROVED) {
            User user = request.getUser();
            user.setRole(Role.ROLE_SELLER);
            userRepository.save(user);
        } else if (status == VerificationStatus.REJECTED) {
            request.setRejectionReason(reason);
        }

        verificationRepository.save(request);
    }
}
