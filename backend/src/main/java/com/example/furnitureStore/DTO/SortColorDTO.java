package com.example.furnitureStore.DTO;

import java.util.List;
import com.example.furnitureStore.Entities.Furniture;

public class SortColorDTO {
    private List<Furniture> furnitures;
    private List<ColorDTO> color;

    public List<Furniture> getFurnitures() {
        return furnitures;
    }
    public void setFurnitures(List<Furniture> furnitures) {
        this.furnitures = furnitures;
    }
    public List<ColorDTO> getColor() {
        return color;
    }
    public void setColor(List<ColorDTO> color) {
        this.color = color;
    }
    

    
}
