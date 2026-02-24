package com.crafthub.backend.repository;

import com.crafthub.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findAllByDialogueIdOrderByCreatedAtAsc(Long dialogueId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.dialogue.id = :dialogueId AND m.sender.id != :currentUserId AND m.isRead = false")
    void markAllAsReadInDialogue(@Param("dialogueId") Long dialogueId, @Param("currentUserId") Long currentUserId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.dialogue.id = :dialogueId AND m.sender.id != :currentUserId AND m.isRead = false")
    long countUnreadMessagesInDialogue(@Param("dialogueId") Long dialogueId, @Param("currentUserId") Long currentUserId);
}