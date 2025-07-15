package com.example.furnitureStore.Controllers;

import java.security.Principal;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.example.furnitureStore.DTO.AddressRequest;
import com.example.furnitureStore.DTO.JwtRequest;
import com.example.furnitureStore.DTO.RefreshTokenRequest;
import com.example.furnitureStore.DTO.RegistrationUserDTO;
import com.example.furnitureStore.Services.AuthService;
import com.example.furnitureStore.Services.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@CrossOrigin(origins = {"http://127.0.0.1:5500"})
@RestController
public class AuthController {
    @Autowired
    private  AuthService authService;
    @Autowired
    private  UserService userService;

    //авторизация
    @PostMapping("/login")
    public ResponseEntity<?> createAuthToken(@RequestBody JwtRequest authRequest) { 
        return authService.createAuthToken(authRequest);
    }
    //регистрация
    @PostMapping("/registration")
    public ResponseEntity<?> createNewUser(@RequestBody RegistrationUserDTO registrationUserDto) {
        return authService.createNewUser(registrationUserDto);
    }

    @PutMapping("/recoveryPassword")
    public ResponseEntity<?> recoveryPassword(@RequestBody String email) {
        return authService.recoveryPassword(email);
    }

    @PostMapping("/refreshToken")
    public ResponseEntity<?> refreshAccessToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        if (refreshTokenRequest.getRefreshToken() == null || refreshTokenRequest.getRefreshToken().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Refresh token is required"));
        }
        return authService.refreshAccessToken(refreshTokenRequest.getRefreshToken());
    }

    @PostMapping("/save-address")
    public ResponseEntity<?> saveAddress(@RequestBody AddressRequest address, Principal principal) {
        return userService.handleAddressOperation(principal, userId -> {
            if (address.getAddress() == null || address.getAddress().isBlank()) {
                throw new IllegalArgumentException("Адрес не может быть пустым");
            }
            userService.updateUserAddressById(userId, address.getAddress());
        });
    }

    @DeleteMapping("/delete-address")
    public ResponseEntity<?> deleteAddress(Principal principal) {
        return userService.handleAddressOperation(principal, userId -> {
            userService.clearUserAddress(userId);
        });
    }

    @GetMapping("/recipient-info")
    public ResponseEntity<?> getRecipientInfo(Principal principal) {
        try {
            Long userId = Long.valueOf(principal.getName());
            return ResponseEntity.ok(userService.getRecipientInfo(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

}