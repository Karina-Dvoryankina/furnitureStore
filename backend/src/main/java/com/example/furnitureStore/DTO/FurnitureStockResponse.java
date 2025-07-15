package com.example.furnitureStore.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FurnitureStockResponse {
    private boolean isStock;
    private long volume;
}
