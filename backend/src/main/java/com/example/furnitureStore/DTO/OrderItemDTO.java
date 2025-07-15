package com.example.furnitureStore.DTO;

import java.math.BigDecimal;

import com.example.furnitureStore.Entities.OrderItem;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long furnitureId;
    private int quantity;
    private BigDecimal price;
    private String article;       
    private String name;         
    private String color;        
    private Double width;    
    private Double height;   
    private Double depth;    
    private String imageUrl;
    
    public OrderItemDTO(OrderItem item) {
        this.furnitureId = item.getFurniture().getId();
        this.name = item.getFurniture().getName();
        this.quantity = item.getQuantity();
        this.price = item.getPricePerItem();
        this.article = item.getArticle();
        this.name = item.getName();
        this.color = item.getColor();
        this.width = item.getWidth();
        this.height = item.getHeight();
        this.depth = item.getDepth();
        this.imageUrl = item.getImageUrl();
    }
}
