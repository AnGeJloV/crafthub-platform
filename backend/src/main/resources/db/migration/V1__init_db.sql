-- V1: Инициализация базовой схемы данных
-- Создание таблицы пользователей (users)

CREATE TABLE users
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    full_name      VARCHAR(255) NOT NULL,
    phone_number   VARCHAR(20)  NOT NULL,
    role           VARCHAR(50)  NOT NULL,
    avatar_url     VARCHAR(500),
    bio            VARCHAR(1000),
    average_rating DECIMAL(3, 2) DEFAULT 0.0,
    reviews_count  INT           DEFAULT 0,
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);