package com.example.furnitureStore.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.furnitureStore.Entities.Cart;
import com.example.furnitureStore.Entities.CartItems;
import com.example.furnitureStore.Entities.CartItemsId;
import com.example.furnitureStore.Entities.Furniture;
import com.example.furnitureStore.Entities.User;

@Repository
public interface CartItemsRepository extends JpaRepository<CartItems, CartItemsId> {

    // Найти все записи для корзины пользователя
    List<CartItems> findByCartUser(User user);
    
    // Найти конкретную запись по пользователю и товару
    Optional<CartItems> findByCartUserAndFurniture(User user, Furniture furniture);
    
    // Удалить все записи для корзины пользователя
    void deleteByCartUser(User user);
    
    // Найти все записи для конкретной корзины
    List<CartItems> findAllByCart(Cart cart);

    void deleteByCart(Cart cart);
}
