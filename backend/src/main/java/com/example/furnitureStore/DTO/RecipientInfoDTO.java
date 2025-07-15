package com.example.furnitureStore.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecipientInfoDTO {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
}
