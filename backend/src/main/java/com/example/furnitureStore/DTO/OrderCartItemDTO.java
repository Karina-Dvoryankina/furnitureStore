package com.example.furnitureStore.DTO;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCartItemDTO {
    private Long id;
    private String syncStatus;
    private String source;
    private int quantity;
    private BigDecimal price;
    private String color;

    public void setId(Long id){
        this.id = id;
    }

    public void setSyncStatus(String syncStatus){
        this.syncStatus = syncStatus;
    }

    public void setSource(String source){
        this.source = source;
    }

    public void setQuantity(int quantity){
        this.quantity = quantity;
    }

    public void setPrice(BigDecimal price){
        this.price = price;
    }

    public void setColor(String color){
        this.color = color;
    }

    public Long getId(){
        return this.id;
    }

    public String setSyncStatus(){
        return this.syncStatus;
    }

    public String setSource(){
        return this.source;
    }

    public int setQuantity(){
        return this.quantity;
    }

    public BigDecimal setPrice(){
        return this.price;
    }

    public String setColor(){
        return this.color;
    }

}
