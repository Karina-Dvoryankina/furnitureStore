package com.example.furnitureStore.Entities;

import java.io.Serializable;
import java.util.Objects;


public class FurnitureColorId implements Serializable {

    private Long idFurniture;
    private String colorHex;

    public FurnitureColorId() {
    }

    public FurnitureColorId(Long idFurniture, String colorHex) {
        this.idFurniture = idFurniture;
        this.colorHex = colorHex;
    }

    // Getters and Setters

    public Long getIdFurniture() {
        return idFurniture;
    }

    public void setIdFurniture(Long idFurniture) {
        this.idFurniture = idFurniture;
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FurnitureColorId that = (FurnitureColorId) o;
        return Objects.equals(idFurniture, that.idFurniture) && 
               Objects.equals(colorHex, that.colorHex);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idFurniture, colorHex);
    }
}


