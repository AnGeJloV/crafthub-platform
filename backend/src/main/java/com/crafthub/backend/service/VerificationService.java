package com.crafthub.backend.service;

import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.UserRepository;
import com.crafthub.backend.repository.VerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
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
    private final NotificationService notificationService;

    // Создает новую заявку на верификацию
    @Transactional
    public void applyForVerification(String legalInfo, List<MultipartFile> files) {

        // Получаем текущего юзера
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));

        // Проверка, нет ли уже активной заявки
        if (verificationRepository.existsByUserIdAndStatus(user.getId(), VerificationStatus.PENDING)) {
            throw new IllegalStateException("У вас уже есть заявка на рассмотрении");
        }

        // Создаем и сохраняем заявку в БД
        VerificationRequest request = VerificationRequest.builder()
                .user(user)
                .legalInfo(legalInfo)
                .status(VerificationStatus.PENDING)
                .build();

        List<VerificationDocument> documents = new ArrayList<>();
        for (MultipartFile file : files) {
            String filePath = fileStorageService.saveFile(file, "documents");
            documents.add(VerificationDocument.builder()
                    .fileUrl(filePath)
                    .request(request)
                    .build());
        }
        request.setDocuments(documents);

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
        User user = request.getUser();

        if (status == VerificationStatus.APPROVED) {
            user.setRole(Role.ROLE_SELLER);
            userRepository.save(user);
            notificationService.createNotification(user,"Поздравляем! Ваша заявка одобрена. Теперь вы можете выставлять свои изделия на продажу.", NotificationType.VERIFICATION);
        } else if (status == VerificationStatus.REJECTED) {
            request.setRejectionReason(reason);
            String message = "Ваша заявка на получение статуса продавца отклонена. Причина: " + (reason != null ? reason : "не указана администратором.");
            notificationService.createNotification(user, message, NotificationType.VERIFICATION);
        }

        // Удаляем файлы с жесткого диска
        if (request.getDocuments() != null) {
            request.getDocuments().forEach(doc -> fileStorageService.deleteFile(doc.getFileUrl()));
            request.getDocuments().clear();
        }
        // Затираем JSON с личными данными в базе
        request.setLegalInfo(null);

        verificationRepository.save(request);
    }
}
