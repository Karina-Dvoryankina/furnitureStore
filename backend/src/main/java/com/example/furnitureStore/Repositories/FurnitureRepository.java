package com.example.furnitureStore.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.furnitureStore.DTO.ColorDTO;
import com.example.furnitureStore.DTO.SizeDTO;
import com.example.furnitureStore.Entities.Furniture;

@Repository
public interface FurnitureRepository extends JpaRepository<Furniture, Long> {

    @Query("SELECT COUNT(f) > 0 FROM Furniture f WHERE f.article = :article")
    boolean existsByArticle(@Param("article") String article);

    @Query("SELECT f FROM Furniture f WHERE f.article = :article")
    Optional<Furniture> findByArticle(@Param("article") String article);

    List<Furniture> findByType_NameIn(List<String> typeNames);

    @Query("SELECT DISTINCT f.colors FROM Furniture f WHERE f.type.name = :category")
    List<ColorDTO> findDistinctColorsByCategory(@Param("category") String category);

    @Modifying
    @Query("UPDATE Furniture f SET f.volume = :newVolume WHERE f.id = :id")
    void updateStock(@Param("id") Long id, @Param("newVolume") Long newVolume);

}


