package com.example.furnitureStore.Entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "favorites")
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_favorites")
    private Long idFavorites;

    @ManyToOne
    @JoinColumn(name = "id_user", referencedColumnName = "id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "favorite", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FavoriteItems> favoriteItems;

    public Long getIdFavorites() {
        return idFavorites;
    }

    public void setIdFavorites(Long idFavorites) {
        this.idFavorites = idFavorites;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<FavoriteItems> getFavoriteItems() {
        return favoriteItems;
    }

    public void setFavoriteItems(List<FavoriteItems> favoriteItems) {
        this.favoriteItems = favoriteItems;
    }
}
