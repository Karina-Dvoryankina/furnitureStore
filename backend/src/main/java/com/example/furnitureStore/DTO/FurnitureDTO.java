package com.example.furnitureStore.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class FurnitureDTO {
    private String name;
    private double width;
    private double height;
    private double depth;
    private String firm;
    private TypeDTO type;
    private List<ColorDTO> colors;
    private BigDecimal price;
    private List<String> imageUrls;
    private LocalDateTime time;
    private Long volume;
    private String article;
    private String description;

    
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
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
    public String getFirm() {
        return firm;
    }
    public void setFirm(String firm) {
        this.firm = firm;
    }
    public TypeDTO getType() {
        return type;
    }
    public void setType(TypeDTO type) {
        this.type = type;
    }
    public List<ColorDTO> getColors() {
        return colors;
    }
    public void setColors(List<ColorDTO> colors) {
        this.colors = colors;
    }
    public BigDecimal getPrice() {
        return price;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
    public LocalDateTime getTime() {
        return time;
    }
    public void setTime(LocalDateTime time) {
        this.time = time;
    }
    public Long getVolume() {
        return volume;
    }
    public void setVolume(Long volume) {
        this.volume = volume;
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

}
