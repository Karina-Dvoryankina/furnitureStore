package com.example.furnitureStore.DTO;

import java.util.List;
import com.example.furnitureStore.Entities.Furniture;

public class SortBySizeDTO {
    private List<Furniture> furnitures;
    private List<SizeDTO> sizes;

    public List<Furniture> getFurnitures() {
        return furnitures;
    }
    public void setFurnitures(List<Furniture> furnitures) {
        this.furnitures = furnitures;
    }
    public List<SizeDTO> getSizes() {
        return sizes;
    }
    public void setSizes(List<SizeDTO> sizes) {
        this.sizes = sizes;
    }
       
}
