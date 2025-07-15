package com.example.furnitureStore.DTO;

import java.math.BigDecimal;
import java.util.List;

import com.example.furnitureStore.Entities.Furniture;

public class SortByPriceDTO {

    private List<Furniture> furnitures;
    private BigDecimal priceHigth;
    private BigDecimal priceLow;
    
    public List<Furniture> getFurnitures() {
        return furnitures;
    }
    public void setFurnitures(List<Furniture> furnitures) {
        this.furnitures = furnitures;
    }
    public BigDecimal getPriceHigth() {
        return priceHigth;
    }
    public void setPriceHigth(BigDecimal priceHigth) {
        this.priceHigth = priceHigth;
    }
    public BigDecimal getPriceLow() {
        return priceLow;
    }
    public void setPriceLow(BigDecimal priceLow) {
        this.priceLow = priceLow;
    }

    
}
