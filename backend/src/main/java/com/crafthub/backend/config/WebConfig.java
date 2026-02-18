package com.crafthub.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Глобальная конфигурация CORS для всего приложения.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.path}")
    private String uploadPath;

    // Настраивает доступ к загруженным файлам через URL
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String path = Paths.get(uploadPath).toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/" + uploadPath + "/**")
                .addResourceLocations(path);
    }
}
