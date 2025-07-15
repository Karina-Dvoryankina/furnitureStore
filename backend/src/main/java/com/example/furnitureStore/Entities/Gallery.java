package com.example.furnitureStore.Entities;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "gallery")
public class Gallery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "type")
    private String type;

    @ElementCollection
    @CollectionTable(name = "gallery_images", joinColumns = @JoinColumn(name = "gallery_id"))
    @Column(name = "url")
    private List<String> imageUrls;


    public Gallery() {
    }

    public Gallery(String name, String type) {
        this.name = name;
        this.type = type;
        
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    
}
