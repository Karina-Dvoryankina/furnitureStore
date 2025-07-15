package com.example.furnitureStore.Controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.furnitureStore.DTO.TypeDTO;
import com.example.furnitureStore.Services.TypeService;

@RestController
@RequestMapping("/categories")
public class TypeController {

    private TypeService typeService;

    @Autowired
    public TypeController(TypeService typeService) {
        this.typeService = typeService;
    }

    @PostMapping("/check-exists")
public ResponseEntity<Map<String, Object>> checkCategoryExists(@RequestBody Map<String, String> requestBody) {
    String categoryName = requestBody.get("categoryName");
    TypeDTO typeDTO = typeService.getCategoryByName(categoryName);

    Map<String, Object> responseBody = new HashMap<>();
    responseBody.put("exists", typeDTO != null);
    responseBody.put("category", typeDTO);

    return ResponseEntity.ok(responseBody);
}
    
}
