-- V2: Создание таблицы заявок на верификацию

CREATE TABLE verification_requests
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT      NOT NULL,
    legal_info       TEXT,
    status           VARCHAR(50) NOT NULL,
    rejection_reason TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Внешний ключ, связывающий заявку с таблицей пользователей
    CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Документы, прикрепленные к заявке
CREATE TABLE verification_documents
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT       NOT NULL,
    file_url   VARCHAR(500) NOT NULL,

    -- Если заявка удаляется, то и записи о файлах удаляются
    CONSTRAINT fk_doc_request FOREIGN KEY (request_id) REFERENCES verification_requests (id) ON DELETE CASCADE
);