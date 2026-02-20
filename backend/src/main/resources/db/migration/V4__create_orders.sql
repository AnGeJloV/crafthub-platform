-- V4: Создание таблиц для системы заказов и "Безопасной сделки"

CREATE TABLE orders
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id         BIGINT         NOT NULL,
    total_amount     DECIMAL(10, 2) NOT NULL,
    status           VARCHAR(50)    NOT NULL,
    shipping_address VARCHAR(500)   NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Связь заказа с покупателем
    CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_id) REFERENCES users (id)
);

CREATE TABLE order_items
(
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id          BIGINT         NOT NULL,
    product_id        BIGINT         NOT NULL,
    quantity          INT            NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,

    -- Связь позиции с самим заказом (при удалении заказа удаляются и позиции)
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,

    -- Связь с товаром
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products (id)
);