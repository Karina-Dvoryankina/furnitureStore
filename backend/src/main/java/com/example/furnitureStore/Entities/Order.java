package com.example.furnitureStore.Entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_order")
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "id_user", referencedColumnName = "id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
    
    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;
    
    @Column(name = "delivery_type", nullable = false, length = 50)
    private String deliveryType;
    
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;
    
    @Column(name = "delivery_price")
    private BigDecimal deliveryPrice;
    
    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
    
    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;
    
    @Column(name = "status", nullable = false, length = 20)
    private String status; // "CREATED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return this.id;
    }

    public String getStatus() {
        return this.status;
    }

    public BigDecimal getTotalPrice() {
        return this.totalPrice;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public List<OrderItem> getItems() {
        return this.items;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public void setStatus(String status) {
        this.status = status;
    }

	public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
	}

    public void setDeliveryPrice(BigDecimal deliveryPrice) {
        this.deliveryPrice = deliveryPrice;
        totalPrice = totalPrice.add(deliveryPrice);
    }

    public void setTotalquantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public void addItem(OrderItem item) {
        items.add(item);
        totalPrice = totalPrice.add(item.getPricePerItem().multiply(BigDecimal.valueOf(item.getQuantity())));
        totalQuantity += item.getQuantity();

        System.out.println("Updated Total Price: " + totalPrice);
        System.out.println("Updated Total Quantity: " + totalQuantity);
    }

    public Order() {
        this.totalPrice = BigDecimal.ZERO;  
        this.totalQuantity = 0;  
    }
}
