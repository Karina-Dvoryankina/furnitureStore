package com.example.furnitureStore.Repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.furnitureStore.Entities.Favorite;
import com.example.furnitureStore.Entities.Furniture;
import com.example.furnitureStore.Entities.User;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    // @Query("SELECT COUNT(fi) > 0 FROM FavoriteItems fi WHERE fi.favorite.user = :user AND fi.furniture = :furniture")
    // boolean existsByUserAndFurniture(@Param("user") User user, @Param("furniture") Furniture furniture);

    Optional<Favorite> findByUser(User user);
}
