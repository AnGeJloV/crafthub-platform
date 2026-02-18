-- V2: Создание таблицы заявок на верификацию

CREATE TABLE verification_requests
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT       NOT NULL,
    legal_info       VARCHAR(255) NOT NULL,
    document_url     VARCHAR(500) NOT NULL,
    status           VARCHAR(50)  NOT NULL,
    rejection_reason TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Внешний ключ, связывающий заявку с таблицей пользователей
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);