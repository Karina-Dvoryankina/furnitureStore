package com.example.furnitureStore.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.furnitureStore.Entities.Gallery;

@Repository
public interface GalleryRepository extends JpaRepository<Gallery, Long> {
}
