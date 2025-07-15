package com.example.furnitureStore.DTO;

import java.util.Collection;



public class InformationAboutUser{
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String tokenAccess;
    private String tokenRefresh;
    private String role;
    
   
    public InformationAboutUser(Long id, String firstName, String lastName, String email, String phoneNumber,
            String tokenAccess, String tokenRefresh, String role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.tokenAccess = tokenAccess;
        this.tokenRefresh = tokenRefresh;
        this.role = role;
    }
    
    public InformationAboutUser(Integer id, String firstName, String lastName, String phoneNumber, String email,
                                 String tokenAccess, String tokenRefresh, String role) {
        this.id = Long.parseLong(String.valueOf(id));
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.tokenAccess = tokenAccess;
        this.tokenRefresh = tokenRefresh;
        this.role = role;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPhoneNumber() {
        return phoneNumber;
    }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    public String getTokenAccess() {
        return tokenAccess;
    }
    public void setTokenAccess(String tokenAccess) {
        this.tokenAccess = tokenAccess;
    }
    public String getTokenRefresh() {
        return tokenRefresh;
    }
    public void setTokenRefresh(String tokenRefresh) {
        this.tokenRefresh = tokenRefresh;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }

    
    
    

    
}