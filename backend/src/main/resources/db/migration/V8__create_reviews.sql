-- V8: Таблица отзывов и добавление полей рейтинга к товарам и пользователям

ALTER TABLE products
    ADD COLUMN average_rating DECIMAL(3, 2) DEFAULT 0.0,
ADD COLUMN reviews_count INT DEFAULT 0;

CREATE TABLE reviews
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    rating     INT    NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    VARCHAR(1000),
    product_id BIGINT NOT NULL,
    author_id  BIGINT NOT NULL,
    order_id   BIGINT NOT NULL,
    is_reported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);