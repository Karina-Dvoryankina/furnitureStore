package com.example.furnitureStore.Entities;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;

@Entity
@Table(name = "furniture_colors")
@IdClass(FurnitureColorId.class)
public class FurnitureColor {

    @Id
    @Column(name = "id_furniture")
    private Long idFurniture;

    @Id
    @Column(name = "color_hex")
    private String colorHex;

    @ManyToOne
    @JoinColumn(name = "id_furniture", insertable = false, updatable = false)
    @JsonBackReference
    private Furniture furniture;

    @Column(name = "color_name", nullable = false)
    private String colorName;

    // Constructors
    public FurnitureColor() {
    }

    public FurnitureColor(Furniture furniture, String colorName, String colorHex) {
        this.furniture = furniture;
        this.idFurniture = furniture.getId(); 
        System.out.println(furniture.getId()+"furniture_id null");
        this.colorHex = colorHex;
        this.colorName = colorName;
    }

    public FurnitureColor(String colorName, String colorHex) {
        this.colorName = colorName;
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

    public Furniture getFurniture() {
        return furniture;
    }

    public void setFurniture(Furniture furniture) {
        this.furniture = furniture;
        this.idFurniture = furniture != null ? furniture.getId() : null; // Ensure no NullPointerException
    }

    public String getColorName() {
        return colorName;
    }

    public void setColorName(String colorName) {
        this.colorName = colorName;
    }
}
