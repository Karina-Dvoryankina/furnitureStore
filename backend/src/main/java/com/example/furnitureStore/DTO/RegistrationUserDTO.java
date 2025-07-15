package com.example.furnitureStore.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegistrationUserDTO {
    private String firstName;
    private String lastName;
    private String password;
    private String phoneNumber;
    private String confirmPassword;
    private String email;
    private String role;

}

