package com.example.furnitureStore.Entities;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CartItemsId implements Serializable {
    private Long cartId;
    private Long furnitureId;

    public CartItemsId() {
    }

    public CartItemsId(Long cartId, Long furnitureId) {
        this.cartId = cartId;
        this.furnitureId = furnitureId;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Long getFurnitureId() {
        return furnitureId;
    }

    public void setFurnitureId(Long furnitureId) {
        this.furnitureId = furnitureId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemsId that = (CartItemsId) o;
        return Objects.equals(cartId, that.cartId) && Objects.equals(furnitureId, that.furnitureId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cartId, furnitureId);
    }
}
