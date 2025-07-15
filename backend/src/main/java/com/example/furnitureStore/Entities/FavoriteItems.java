package com.example.furnitureStore.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "favorite_items")
public class FavoriteItems {

    @EmbeddedId
    private FavoriteItemsId id;

    @ManyToOne
    @MapsId("favoriteId")
    @JoinColumn(name = "id_favorites", referencedColumnName = "id_favorites", nullable = false)
    private Favorite favorite;

    @ManyToOne
    @MapsId("furnitureId")
    @JoinColumn(name = "id_furniture", referencedColumnName = "id", nullable = false)
    private Furniture furniture;

    public FavoriteItemsId getId() {
        return id;
    }

    public void setId(FavoriteItemsId id) {
        this.id = id;
    }

    public Favorite getFavorite() {
        return favorite;
    }

    public void setFavorite(Favorite favorite) {
        this.favorite = favorite;
    }

    public Furniture getFurniture() {
        return furniture;
    }

    public void setFurniture(Furniture furniture) {
        this.furniture = furniture;
    }
}
