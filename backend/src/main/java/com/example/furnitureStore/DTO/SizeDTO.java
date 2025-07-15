package com.example.furnitureStore.DTO;

import java.util.Objects;

public class SizeDTO {
    private double width;
    private double height;
    private double depth;

    public SizeDTO(double width, double height, double depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
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

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        SizeDTO sizeDTO = (SizeDTO) o;
        return Double.compare(sizeDTO.width, width) == 0 &&
                Double.compare(sizeDTO.height, height) == 0 &&
                Double.compare(sizeDTO.depth, depth) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(width, height, depth);
    }

}
