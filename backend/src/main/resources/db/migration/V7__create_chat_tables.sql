-- V7: Создание таблиц для системы личных сообщений (Чаты)

CREATE TABLE dialogues
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id   BIGINT NOT NULL,
    seller_id  BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_dialogue_buyer FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_dialogue_seller FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_dialogue_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE TABLE chat_messages
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    dialogue_id  BIGINT        NOT NULL,
    sender_id    BIGINT        NOT NULL,
    message_text VARCHAR(1000) NOT NULL,
    is_read      BOOLEAN   DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_dialogue FOREIGN KEY (dialogue_id) REFERENCES dialogues (id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
);