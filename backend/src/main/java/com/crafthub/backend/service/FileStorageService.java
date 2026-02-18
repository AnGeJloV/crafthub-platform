package com.crafthub.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Сервис для управления файловой системой.
 * Отвечает за сохранение документов в иерархическую структуру папок по датам.
 */
@Service
public class FileStorageService {

    @Value("${upload.path}")
    private String uploadPath;

    /**
     * Сохраняет файл на диск и возвращает относительный путь.
     *
     * @param file объект MultipartFile из запроса.
     * @return путь к файлу вида "yyyy/MM/dd/uuid_name.ext".
     */
    public String saveFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Файл пуст");
            }

            // Путь на основе текущей даты
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            Path targetDirectory = Paths.get(uploadPath, datePath);

            // Создаем папки, если их еще нет
            Files.createDirectories(targetDirectory);

            // Генерируем уникальное имя файла: uuid_originalName
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetFile = targetDirectory.resolve(fileName);

            // Копируем содержимое файла на диск
            Files.copy(file.getInputStream(), targetFile);

            // Возвращаем относительный путь для сохранения в БД
            return datePath + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Не удалось сохранить файл: " + e.getMessage());
        }
    }
}
