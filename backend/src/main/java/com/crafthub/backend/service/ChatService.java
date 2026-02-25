package com.crafthub.backend.service;

import com.crafthub.backend.dto.request.SendMessageRequest;
import com.crafthub.backend.dto.response.DialogueResponse;
import com.crafthub.backend.dto.response.MessageResponse;
import com.crafthub.backend.model.*;
import com.crafthub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final DialogueRepository dialogueRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<DialogueResponse> getMyDialogues() {
        User currentUser = getCurrentUser();
        List<Dialogue> dialogues = dialogueRepository.findAllUserDialogues(currentUser.getId());

        return dialogues.stream().map(d -> {

            User interlocutor = d.getBuyer().getId().equals(currentUser.getId()) ? d.getSeller() : d.getBuyer();

            List<ChatMessage> messages = messageRepository.findAllByDialogueIdOrderByCreatedAtAsc(d.getId());
            String lastMsgText = messages.isEmpty() ? "Диалог создан" : messages.get(messages.size() - 1).getText();
            LocalDateTime lastMsgTime = messages.isEmpty() ? d.getCreatedAt() : messages.get(messages.size() - 1).getCreatedAt();

            long unread = messageRepository.countUnreadMessagesInDialogue(d.getId(), currentUser.getId());

            String image = d.getProduct().getImages().stream()
                    .filter(ProductImage::isMain).findFirst()
                    .map(ProductImage::getImageUrl).orElse("");

            return new DialogueResponse(
                    d.getId(),
                    d.getProduct().getId(),
                    d.getProduct().getName(),
                    image,
                    interlocutor.getFullName(),
                    lastMsgText,
                    lastMsgTime,
                    interlocutor.getId(),
                    unread
            );
        }).toList();
    }

    @Transactional
    public List<MessageResponse> getMessages(Long dialogueId) {
        User currentUser = getCurrentUser();

        Dialogue dialogue = dialogueRepository.findById(dialogueId)
                .orElseThrow(() -> new RuntimeException("Диалог не найден"));

        if (!dialogue.getBuyer().getId().equals(currentUser.getId()) && !dialogue.getSeller().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Доступ запрещен");
        }

        messageRepository.markAllAsReadInDialogue(dialogueId, currentUser.getId());

        return messageRepository.findAllByDialogueIdOrderByCreatedAtAsc(dialogueId).stream()
                .map(m -> new MessageResponse(
                        m.getId(),
                        m.getText(),
                        m.getSender().getId(),
                        m.getSender().getFullName(),
                        m.getSender().getId().equals(currentUser.getId()),
                        m.isRead(),
                        m.getCreatedAt()
                )).toList();
    }

    @Transactional
    public Long sendMessage(SendMessageRequest request) {
        User sender = getCurrentUser();
        Dialogue dialogue;

        if (request.dialogueId() != null) {
            dialogue = dialogueRepository.findById(request.dialogueId())
                    .orElseThrow(() -> new RuntimeException("Диалог не найден"));
        } else {
            Product product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new RuntimeException("Товар не найден"));

            User buyer;
            if (sender.getId().equals(product.getSeller().getId())) {
                buyer = userRepository.findById(request.recipientId())
                        .orElseThrow(() -> new IllegalArgumentException("Не указан покупатель"));
            } else {
                buyer = sender;
            }

            dialogue = dialogueRepository.findByBuyerIdAndProductId(buyer.getId(), product.getId())
                    .orElseGet(() -> dialogueRepository.save(Dialogue.builder()
                            .buyer(buyer)
                            .seller(product.getSeller())
                            .product(product)
                            .build()));
        }

        User recipient = dialogue.getBuyer().getId().equals(sender.getId()) ? dialogue.getSeller() : dialogue.getBuyer();

        ChatMessage message = ChatMessage.builder()
                .dialogue(dialogue)
                .sender(sender)
                .text(request.text())
                .isRead(false)
                .build();

        messageRepository.save(message);
        dialogue.setUpdatedAt(LocalDateTime.now());
        dialogueRepository.save(dialogue);

        notificationService.createNotification(
                recipient,
                "Новое сообщение по товару " + dialogue.getProduct().getName(),
                NotificationType.MESSAGE
        );

        return dialogue.getId();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Ищет существующий диалог между текущим пользователем и товаром.
     */
    @Transactional(readOnly = true)
    public Long findExistingDialogue(Long productId, Long recipientId) {
        User currentUser = getCurrentUser();
        Long targetBuyerId = (recipientId != null) ? recipientId : currentUser.getId();

        return dialogueRepository.findByBuyerIdAndProductId(targetBuyerId, productId)
                .map(Dialogue::getId)
                .orElse(null);
    }

    /**
     * Удаляет диалог и все его сообщения.
     */
    @Transactional
    public void deleteDialogue(Long dialogueId) {
        User currentUser = getCurrentUser();
        Dialogue dialogue = dialogueRepository.findById(dialogueId)
                .orElseThrow(() -> new RuntimeException("Диалог не найден"));

        if (!dialogue.getBuyer().getId().equals(currentUser.getId()) && !dialogue.getSeller().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Нет прав на удаление этого диалога");
        }

        dialogueRepository.delete(dialogue);
    }
}