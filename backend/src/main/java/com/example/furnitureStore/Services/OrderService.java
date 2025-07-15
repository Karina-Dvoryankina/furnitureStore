package com.example.furnitureStore.Services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import com.example.furnitureStore.DTO.CreateOrderDTO;
import com.example.furnitureStore.DTO.OrderCartItemDTO;
import com.example.furnitureStore.DTO.OrderResponseDTO;
import com.example.furnitureStore.Entities.Cart;
import com.example.furnitureStore.Entities.Furniture;
import com.example.furnitureStore.Entities.Order;
import com.example.furnitureStore.Entities.OrderItem;
import com.example.furnitureStore.Entities.User;
import com.example.furnitureStore.Repositories.CartRepository;
import com.example.furnitureStore.Repositories.FurnitureRepository;
import com.example.furnitureStore.Repositories.OrderRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final FurnitureRepository furnitureRepository;
    private final FurnitureService furnitureService; 
    private final CartRepository cartRepository; 

    @Transactional
    public OrderResponseDTO createOrder(CreateOrderDTO dto, Long userId) {

        User user = furnitureService.FindUser(userId);

        // Проверяем наличие товаров
        Map<Furniture, Long> stockMap = verifyStockAndPrepareUpdates(dto.getCart());
        
        // Создаем заказ
        Order order = createOrderEntity(dto, user, dto.getCart());

        // Очищаем корзину
        clearUserCart(user);
        
        // Обновляем остатки
        updateStockQuantities(stockMap);
        
        return new OrderResponseDTO(order);
    }

    
    private void clearUserCart(User user) {
        Cart cart = furnitureService.FindCart(user);
        
        cart.getCartItems().clear();
        cart.setTotalQuanity(0);
        cart.setTotalPrice(BigDecimal.ZERO);
        
        cartRepository.save(cart); 
    }


    private Map<Furniture, Long> verifyStockAndPrepareUpdates(List<OrderCartItemDTO> cartItems) {
        Map<Furniture, Long> stockMap = new HashMap<>();
        
        for (OrderCartItemDTO cartItem : cartItems) {
            Furniture item = furnitureRepository.findById(cartItem.getId())
                .orElseThrow(() -> new EntityNotFoundException(
                    "Furniture not found: " + cartItem.getId()));
                
            if (item.getVolume() < cartItem.getQuantity()) {
                throw new IllegalStateException(
                    "Not enough stock for item: " + item.getName() + 
                    ". Available: " + item.getVolume() + 
                    ", requested: " + cartItem.getQuantity());
            }
            stockMap.put(item, item.getVolume() - cartItem.getQuantity());
        }
        
        return stockMap;
    }

    private Order createOrderEntity(CreateOrderDTO dto, User user, List<OrderCartItemDTO> cartItems) {
        Order order = new Order();
        order.setUser(user);
        order.setDeliveryType(dto.getDeliveryType());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setDeliveryPrice(dto.getDeliveryPrice());
        order.setStatus("CREATED");
    
        Order savedOrder = orderRepository.save(order);
    
        for (OrderCartItemDTO cartItem : cartItems) {
            Furniture furniture = furnitureRepository.findById(cartItem.getId())
                .orElseThrow(() -> new EntityNotFoundException("Furniture not found: " + cartItem.getId()));
    

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setFurniture(furniture);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPricePerItem(furniture.getPrice());
            orderItem.setArticle(furniture.getArticle());
            orderItem.setName(furniture.getName());
            orderItem.setColor(cartItem.getColor());
            orderItem.setWidth(furniture.getWidth());
            orderItem.setHeight(furniture.getHeight());
            orderItem.setDepth(furniture.getDepth());
            orderItem.setImageUrl(furniture.getImages().isEmpty() ? null : furniture.getImages().get(0));
    
            savedOrder.addItem(orderItem); 
        }
    
        return orderRepository.save(savedOrder); 
    }
    
    
    private void updateStockQuantities(Map<Furniture, Long> stockMap) {
        stockMap.forEach((furniture, newStock) -> {
            furniture.setVolume(newStock);
        });
    }
}