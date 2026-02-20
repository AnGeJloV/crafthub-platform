-- V4: Создание таблиц для серверной корзины

CREATE TABLE carts
(
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE cart_items
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id    BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity   INT    NOT NULL DEFAULT 1,
    CONSTRAINT fk_item_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);