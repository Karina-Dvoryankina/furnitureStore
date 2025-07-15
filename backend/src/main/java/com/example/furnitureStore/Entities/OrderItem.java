package com.example.furnitureStore.Entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Table(name = "order_items")
public class OrderItem {

    @EmbeddedId
    private OrderItemId id = new OrderItemId();
    
    @ManyToOne
    @MapsId("orderId")
    @JoinColumn(name = "order_id", nullable = false)   
    private Order order;
    
    @ManyToOne
    @MapsId("furnitureId")
    @JoinColumn(name = "furniture_id", nullable = false)
    private Furniture furniture;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "price_per_item", nullable = false)
    private BigDecimal pricePerItem;
    
    @Column(name = "article", length = 50, nullable = false)
    private String article;
    
    @Column(name = "name", length = 255, nullable = false)
    private String name;
    
    @Column(name = "color", length = 50)
    private String color;
    
    @Column(name = "width")
    private Double width;
    
    @Column(name = "height")
    private Double height;
    
    @Column(name = "depth")
    private Double depth;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    public Furniture getFurniture() {
        return this.furniture;
    }

    public double getWidth(){
        return this.width;
    }

    public double getHeight(){
        return this.height;
    }

    public double getDepth(){
        return this.depth;
    }

    public String getImageUrl(){
        return this.imageUrl;
    }

    public String getArticle(){
        return this.article;
    }

    public String getName(){
        return this.name;
    }

    public String getColor(){
        return this.color;
    }

    public int getQuantity() {
        return this.quantity;
    }

    public BigDecimal getPricePerItem() {
        return this.pricePerItem;
    }

    public void setOrder(Order order) {
        this.order = order;
        this.id.setOrderId(order != null ? order.getId() : null);
    }

    public void setFurniture(Furniture furniture) {
        this.furniture = furniture;
        this.id.setFurnitureId(furniture != null ? furniture.getId() : null);
    }

    public void setPricePerItem(BigDecimal pricePerItem) {
        this.pricePerItem = pricePerItem;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setArticle(String article) {
        this.article = article;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void setDepth(double depth) {
        this.depth = depth;
    }

    public void setId(OrderItemId orderItemId) {
        this.id = orderItemId;
    }

    public OrderItemId getId() {
        return this.id;
    }
}