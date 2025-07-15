package com.example.furnitureStore.Repositories;

import com.example.furnitureStore.Entities.Order;
import com.example.furnitureStore.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // 1. Найти все заказы пользователя
    List<Order> findByUser(User user);
    
    // 2. Найти заказы пользователя по email
    @Query("SELECT o FROM Order o WHERE o.user.email = :email ORDER BY o.createdAt DESC")
    List<Order> findByUserEmail(@Param("email") String email);
    
    // 3. Найти заказы по статусу
    List<Order> findByStatus(String status);
    
    // 4. Найти заказы за период
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // 5. Найти заказы с определенным товаром
    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.furniture.id = :furnitureId")
    List<Order> findOrdersContainingFurniture(@Param("furnitureId") Long furnitureId);
    
    // 6. Обновление статуса заказа
    @Query("UPDATE Order o SET o.status = :status WHERE o.id = :orderId")
    void updateOrderStatus(@Param("orderId") Long orderId, @Param("status") String status);
    
    // 7. Получить общую сумму продаж
    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = 'DELIVERED'")
    Double getTotalSales();
    
    // 8. Получить последние N заказов
    @Query(value = "SELECT * FROM orders ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<Order> findRecentOrders(@Param("limit") int limit);
}
