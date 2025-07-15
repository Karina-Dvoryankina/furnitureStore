package com.example.furnitureStore.Entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

@Entity
@Table(name="furniture")
public class Furniture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name = "article")
    private String article;

    @Column(name="name")
    private String name;

    @ManyToOne
    @JoinColumn(name = "type_id", referencedColumnName = "id")
    private Type type;

    @Column(name="width")
    private double width;

    @Column(name="height")
    private double height;

    @Column(name="depth")
    private double depth;

    @Column(name="firm")
    private String firm;

    @Column(name="price")
    private BigDecimal price;

    @Column(name="rating")
    private Long rating;

    @Column(name="volume")
    private Long volume;

    @Column(name="sold")
    private Long sold;

    @Column(name="time")
    private LocalDateTime time;

    @Column(name="description") 
    private String description;

    @OneToMany(mappedBy = "furniture", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<FurnitureColor> colors = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name="furniture_images", joinColumns=@JoinColumn(name="id_furniture"))
    @Column(name="url")
    private List<String> imageUrls;

    public Long getVolume() {
        return volume;
    }

    public void setVolume(Long volume) {
        this.volume = volume;
    }

    public Long getSold() {
        return sold;
    }

    public void setSold(Long sold) {
        this.sold = sold;
    }

    public Furniture() {
    }

    public Furniture(String name, double width, double height, double depth, String firm, Type type, List<FurnitureColor> colors,
    BigDecimal price, List<String> imageUrls,LocalDateTime time, Long volume, String article, String description) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.firm = firm;
        this.type = type;
        this.colors = colors;
        this.price = price;
        this.imageUrls = imageUrls;
        this.time = time;
        this.volume = volume;
        this.article = article;
        this.description = description;
    }


    public double getWidth() {
        return width;
    }


    public void setWidth(double width) {
        this.width = width;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getDepth() {
        return depth;
    }

    public void setDepth(double depth) {
        this.depth = depth;
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


    public String getFirm() {
        return firm;
    }

    public void setFirm(String firm) {
        this.firm = firm;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public List<FurnitureColor> getColors() {
        return colors;
    }

    public void setColors(List<FurnitureColor> colors) {
        this.colors = colors;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public Long getRating() {
        return rating;
    }

    public void setRating(Long rating) {
        this.rating = rating;
    }

    public String getArticle() {
        return article;
    }

    public void setArticle(String article) {
        this.article = article;
    }
    
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getImages() {
        return imageUrls;
    }

    public void setImages(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
    
}

