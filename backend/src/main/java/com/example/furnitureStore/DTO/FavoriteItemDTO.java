package com.example.furnitureStore.DTO;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor

public class FavoriteItemDTO {
    private Long id;
    private String syncStatus;
    private String source;
}
