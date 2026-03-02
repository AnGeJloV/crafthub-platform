package com.crafthub.backend.repository;

import com.crafthub.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Список всех уведомлений юзера (от новых к старым)
    List<Notification> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    // Только непрочитанные уведомления (для счетчика на иконке колокольчика)
    List<Notification> findAllByUserIdAndIsReadFalse(Long userId);

    // Удалить все уведомления юзера (функция "Очистить всё")
    @Modifying
    @Transactional
    void deleteAllByUserId(Long userId);
}
