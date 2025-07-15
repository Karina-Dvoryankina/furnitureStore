package com.example.furnitureStore.Services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.furnitureStore.DTO.TypeDTO;
import com.example.furnitureStore.Entities.Type;
import com.example.furnitureStore.Repositories.TypeRepository;

@Service
public class TypeService {

    @Autowired
    private TypeRepository typeRepository;

    public TypeDTO getCategoryByName(String categoryName) {
        Type type = typeRepository.findByName(categoryName);
        if (type != null) {
            TypeDTO typeDTO = new TypeDTO();
            typeDTO.setId(type.getId());
            typeDTO.setName(type.getName());
            return typeDTO;
        }
        return null;
    }

    public TypeDTO getCategoryById(Long id) {
        Optional<Type> type = typeRepository.findById(id);
        if (type.isPresent()) {
            TypeDTO typeDTO = new TypeDTO();
            typeDTO.setId(type.get().getId());
            typeDTO.setName(type.get().getName());
            return typeDTO;
        }
        return null;
    }
}
