package com.example.furnitureStore.Repositories;

import com.example.furnitureStore.Entities.Furniture;
import com.example.furnitureStore.Entities.FurnitureColor;
import com.example.furnitureStore.Entities.FurnitureColorId;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface FurnitureColorRepository extends JpaRepository<FurnitureColor, FurnitureColorId> {

    List<FurnitureColor> findByFurniture(Furniture savedFurniture);
    
    List<FurnitureColor> findDistinctByIdFurnitureIn(List<Long> furnitureIds);
}

