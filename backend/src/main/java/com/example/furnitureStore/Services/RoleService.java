package com.example.furnitureStore.Services;

import org.springframework.stereotype.Service;

import com.example.furnitureStore.Entities.Role;
import com.example.furnitureStore.Repositories.RoleRepository;

import lombok.RequiredArgsConstructor;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;

    public Optional<Role> getUserRole(String roleName) {
        return roleRepository.findByName(roleName);
    }
}