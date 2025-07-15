package com.example.furnitureStore.DTO;

import java.util.List;

public class GalleryDTO {
   
    private String name;
    private String type;
    private List<String> imageUrls;
    
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
