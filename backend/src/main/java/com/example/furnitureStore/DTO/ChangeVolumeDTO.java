package com.example.furnitureStore.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChangeVolumeDTO {
    private Long furnitureId;
    private int Volume;
}
