package com.example.furnitureStore.DTO;

import java.math.BigDecimal;
import java.util.List;
import java.time.format.DateTimeFormatter;
import com.example.furnitureStore.Entities.Order;

import lombok.Data;

@Data
public class OrderResponseDTO {
    private Long orderId;
    private String status;
    private BigDecimal totalPrice;
    private List<OrderItemDTO> items;
    private String createdAt;
    
    public OrderResponseDTO(Order order) {
        this.orderId = order.getId();
        this.status = order.getStatus();
        this.totalPrice = order.getTotalPrice();
        this.createdAt = order.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME);
        this.items = order.getItems().stream()
            .map(OrderItemDTO::new)
            .toList();
    }
}