package com.crafthub.backend.repository;

import com.crafthub.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Репозиторий для доступа к категориям
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Найти категорию по системному имени (например, "WOODWORK")
    Optional<Category> findByName(String name);
}
