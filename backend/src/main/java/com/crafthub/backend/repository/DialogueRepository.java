package com.crafthub.backend.repository;

import com.crafthub.backend.model.Dialogue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DialogueRepository extends JpaRepository<Dialogue, Long> {

    @Query("SELECT d FROM Dialogue d WHERE d.buyer.id = :userId OR d.seller.id = :userId ORDER BY d.updatedAt DESC")
    List<Dialogue> findAllUserDialogues(@Param("userId") Long userId);

    Optional<Dialogue> findByBuyerIdAndProductId(Long buyerId, Long productId);
}