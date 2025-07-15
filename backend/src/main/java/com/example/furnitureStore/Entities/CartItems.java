package com.example.furnitureStore.Entities;
import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_items")
public class CartItems {
    @EmbeddedId
    private CartItemsId id;

    @ManyToOne
    @MapsId("cartId")
    @JoinColumn(name = "id_cart", referencedColumnName = "id_cart", nullable = false)
    private Cart cart;

    @Column(name="quantity")
    private Integer quantity;

    @Column(name="price")
    private BigDecimal price;

    @ManyToOne
    @MapsId("furnitureId")
    @JoinColumn(name = "id_furniture", referencedColumnName = "id", nullable = false)
    private Furniture furniture;

    public Integer getQuanity(){
        return quantity;
    }

    public void setQuanity(Integer quantity){
        this.quantity = quantity;
    }

    public BigDecimal getPrice(){
        return price;
    }

    public void setPrice(BigDecimal price){
        this.price = price;
    }

    public CartItemsId getId() {
        return id;
    }

    public void setId(CartItemsId id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Furniture getFurniture() {
        return furniture;
    }

    public void setFurniture(Furniture furniture) {
        this.furniture = furniture;
    }

}
