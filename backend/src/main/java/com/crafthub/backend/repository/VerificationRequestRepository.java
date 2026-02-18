package com.crafthub.backend.repository;

import com.crafthub.backend.model.VerificationRequest;
import com.crafthub.backend.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {
    // Найти все заявки конкретного пользователя
    List<VerificationRequest> findByUserId(Long userId);

    // Найти все заявки с определенным статусом (нужно админу для фильтрации)
    List<VerificationRequest> findByStatus(VerificationStatus status);

    // Проверить, есть ли у пользователя заявка, которая сейчас на рассмотрении
    boolean existsByUserIdAndStatus(Long userId, VerificationStatus status);
}
