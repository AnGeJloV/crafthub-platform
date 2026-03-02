package com.crafthub.backend.repository;

import com.crafthub.backend.model.Dialogue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DialogueRepository extends JpaRepository<Dialogue, Long> {

    // Список всех диалогов юзера (где он либо покупатель, либо продавец)
    // Сортировка: чаты с новыми сообщениями сверху
    @Query("SELECT d FROM Dialogue d WHERE d.buyer.id = :userId OR d.seller.id = :userId ORDER BY d.updatedAt DESC")
    List<Dialogue> findAllUserDialogues(@Param("userId") Long userId);

    // Поиск существующего диалога по паре Покупатель + Товар (чтобы не плодить дубли чатов)
    Optional<Dialogue> findByBuyerIdAndProductId(Long buyerId, Long productId);
}