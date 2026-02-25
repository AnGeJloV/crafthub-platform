package com.crafthub.backend.dto.response;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Integer rating,
        String comment,
        String authorName,
        LocalDateTime createdAt
) {}