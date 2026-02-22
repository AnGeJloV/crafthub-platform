-- V3: Создание таблиц категорий и товаров

CREATE TABLE categories
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL
);

CREATE TABLE products
(
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(255)   NOT NULL,
    description      TEXT,
    price            DECIMAL(10, 2) NOT NULL,
    stock_quantity   INT            NOT NULL DEFAULT 0,
    youtube_video_id VARCHAR(50),
    status           VARCHAR(50)    NOT NULL,
    category_id      BIGINT         NOT NULL,
    seller_id        BIGINT         NOT NULL,
    created_at       TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP               DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE product_images
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT       NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    is_main    BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

INSERT INTO categories (name, display_name)
VALUES ('WOODWORK', 'Деревянные изделия'),
       ('CERAMICS', 'Керамика'),
       ('TEXTILES', 'Текстиль и одежда'),
       ('DECOR', 'Декор для дома'),
       ('JEWELRY', 'Украшения');