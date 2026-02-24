package com.crafthub.backend.controller;

import com.crafthub.backend.dto.request.SendMessageRequest;
import com.crafthub.backend.dto.response.DialogueResponse;
import com.crafthub.backend.dto.response.MessageResponse;
import com.crafthub.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<DialogueResponse>> getMyDialogues() {
        return ResponseEntity.ok(chatService.getMyDialogues());
    }

    @GetMapping("/{dialogueId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable Long dialogueId) {
        return ResponseEntity.ok(chatService.getMessages(dialogueId));
    }

    @PostMapping("/send")
    public ResponseEntity<Long> sendMessage(@RequestBody @Valid SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(request));
    }

    @GetMapping("/find")
    public ResponseEntity<Long> findDialogue(@RequestParam Long productId) {
        return ResponseEntity.ok(chatService.findExistingDialogue(productId));
    }
}