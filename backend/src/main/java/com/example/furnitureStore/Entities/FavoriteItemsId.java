package com.example.furnitureStore.Entities;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class FavoriteItemsId implements Serializable {
    private Long favoriteId;
    private Long furnitureId;

    public FavoriteItemsId() {
    }

    public FavoriteItemsId(Long favoriteId, Long furnitureId) {
        this.favoriteId = favoriteId;
        this.furnitureId = furnitureId;
    }

    public Long getFavoriteId() {
        return favoriteId;
    }

    public void setFavoriteId(Long favoriteId) {
        this.favoriteId = favoriteId;
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
        FavoriteItemsId that = (FavoriteItemsId) o;
        return Objects.equals(favoriteId, that.favoriteId) && Objects.equals(furnitureId, that.furnitureId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(favoriteId, furnitureId);
    }
}
