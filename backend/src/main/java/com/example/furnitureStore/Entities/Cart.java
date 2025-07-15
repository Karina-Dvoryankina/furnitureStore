package com.example.furnitureStore.Entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "cart")
public class Cart {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cart")
    private Long idCart;

    @ManyToOne
    @JoinColumn(name = "id_user", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name="total_quantity")
    private Integer totalQuantity;

    @Column(name="total_price")
    private BigDecimal totalPrice;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItems> cartItems;

    public Integer getTotalQuanity(){
        return totalQuantity;
    }

    public void setTotalQuanity(Integer totalQuantity){
        this.totalQuantity = totalQuantity;
    }

    public BigDecimal getTotalPrice(){
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice){
        this.totalPrice = totalPrice;
    }

    public Long getIdCart() {
        return idCart;
    }

    public void setIdCart(Long idCart) {
        this.idCart = idCart;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<CartItems> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItems> cartItems) {
        this.cartItems = cartItems;
    }
}
