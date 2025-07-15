package com.example.furnitureStore.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.furnitureStore.Entities.Favorite;
import com.example.furnitureStore.Entities.FavoriteItems;
import com.example.furnitureStore.Entities.FavoriteItemsId;
import com.example.furnitureStore.Entities.Furniture;
import com.example.furnitureStore.Entities.User;

@Repository
public interface FavoriteItemsRepository extends JpaRepository<FavoriteItems, FavoriteItemsId> {
    // boolean existsById(@SuppressWarnings("null") FavoriteItemsId id);
    // boolean existsByFavoriteUserAndFurniture(User user, Furniture furniture);
    Optional<FavoriteItems> findByFavoriteUserAndFurniture(User user, Furniture furniture);
    List<FavoriteItems> findAllByFavorite(Favorite favorite);


     // Найти все избранные товары пользователя
    @Query("SELECT fi FROM FavoriteItems fi WHERE fi.favorite.user = :user")
    List<FavoriteItems> findByFavoriteUser(@Param("user") User user);
    
    // Удалить конкретную связь
    void deleteByFavoriteAndFurniture(Favorite favorite, Furniture furniture);
}

