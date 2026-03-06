-- V9: Добавление полей адреса доставки в таблицу пользователей
ALTER TABLE users
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN street VARCHAR(150),
    ADD COLUMN house VARCHAR(50),
    ADD COLUMN zip_code VARCHAR(20);