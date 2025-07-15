package com.example.furnitureStore.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.furnitureStore.DTO.BulkUpdateQuantityDTO;
import com.example.furnitureStore.DTO.CartItemDTO;
import com.example.furnitureStore.DTO.ChangeVolumeDTO;
import com.example.furnitureStore.DTO.ColorDTO;
import com.example.furnitureStore.DTO.FavoriteItemDTO;
import com.example.furnitureStore.DTO.FurnitureDTO;
import com.example.furnitureStore.DTO.FurnitureStockResponse;
import com.example.furnitureStore.DTO.SizeDTO;
import com.example.furnitureStore.DTO.SortAndFilterDTO;
import com.example.furnitureStore.DTO.UpdateQuantityDTO;
import com.example.furnitureStore.Entities.Furniture;
import com.example.furnitureStore.Services.FurnitureService;

import io.jsonwebtoken.lang.Collections;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
public class FurnitureController {

    private final FurnitureService furnitureService;

    @Autowired
    public FurnitureController(FurnitureService furnitureService) {
        this.furnitureService = furnitureService;
    }

    @GetMapping("/furniture/getAll")
    public ResponseEntity<List<Furniture>> getAllFurniture() {
        return ResponseEntity.ok(furnitureService.getAllFurniture());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Furniture> getFurnitureById(@PathVariable Long id) {
        Optional<Furniture> furniture = furnitureService.getFurnitureById(id);
        return furniture.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/admin/furniture/add")
    public ResponseEntity<Furniture> addFurniture(@RequestBody FurnitureDTO furniture, Principal principal) {
        System.out.println("Received DTO: " + furniture.getImageUrls());
        Furniture savedFurniture = furnitureService.saveFurniture(furniture);
        return new ResponseEntity<>(savedFurniture, HttpStatus.CREATED);
    }

    @PostMapping("/furniture/changeRating")
    public ResponseEntity<Furniture> changeRating(@RequestBody Long furnitureId) {
      
        return new ResponseEntity<>(furnitureService.changeRating(furnitureId),HttpStatus.UPGRADE_REQUIRED);
    }

    @PostMapping("/furniture/changeVolume")
    public ResponseEntity<Furniture> changeVolume(@RequestBody ChangeVolumeDTO volume) {
        return new ResponseEntity<>(furnitureService.changeVolume(volume),HttpStatus.UPGRADE_REQUIRED);
    }

    @PostMapping("/furniture/buyFurniture")
    public ResponseEntity<String> buyFurniture(@RequestBody List<Long> furniture) {
        return ResponseEntity.ok(furnitureService.buyFurniture(furniture));
    }

    @GetMapping("/furniture/exists/{article}")
    public boolean checkIfArticleExists(@PathVariable String article) {
        return furnitureService.isArticleExists(article);
    }

    @GetMapping("/furniture/search")
    public ResponseEntity<List<FurnitureDTO>> searchFurniture(@RequestParam String query) {
        List<FurnitureDTO> results = furnitureService.searchFurniture(query);
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/furniture/delete/{article}")
    public ResponseEntity<Void> deleteFurnitureByArticle(@PathVariable String article) {
        try {
            furnitureService.deleteFurnitureByArticle(article);
            return ResponseEntity.noContent().build(); 
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); 
        }
    }

    @PostMapping("/furniture/byCategories")
    public ResponseEntity<Page<Furniture>> getFurnitureByCategories(@RequestBody SortAndFilterDTO requestData) {

        // 1. Получите все данные по типам мебели
        Pageable pageable = PageRequest.of(requestData.getOffset() / requestData.getLimit(), requestData.getLimit());
        List<Furniture> furnitureList = furnitureService.getFurnitureByTypes(requestData.getTypeNames());

        // 2. Фильтрация по цене, цвету и размеру
        if (requestData.getPriceLow() != null && requestData.getPriceHigh() != null) {
            BigDecimal priceLow = new BigDecimal(requestData.getPriceLow().toString());
            BigDecimal priceHigh = new BigDecimal(requestData.getPriceHigh().toString());
            furnitureList = furnitureService.filterByPrice(furnitureList, priceLow, priceHigh);
        }
        if (requestData.getColors() != null && !requestData.getColors().isEmpty()) {
            furnitureList = furnitureService.filterByColor(furnitureList, requestData.getColors());
        }
        if (requestData.getSizes() != null && !requestData.getSizes().isEmpty()) {
            furnitureList = furnitureService.filterBySize(furnitureList, requestData.getSizes());
        }

        // 3. Сортировка
        switch (requestData.getSort()) {
            case "popular":
                furnitureList = furnitureService.sortByPopularity(furnitureList);
                break;
            case "new":
                furnitureList = furnitureService.sortByCreationTime(furnitureList);
                break;
            case "price_up":
                furnitureList = furnitureService.sortByPriceAsc(furnitureList);
                break;
            case "price_down":
                furnitureList = furnitureService.sortByPriceDesc(furnitureList);
                break;
            case "rating":
                furnitureList = furnitureService.sortByRating(furnitureList);
                break;
            default:
                // Без сортировки
                break;
        }


        // 4. Применение пагинации
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), furnitureList.size());
        if(start >= end){
            return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
        }
        Page<Furniture> resultPage = new PageImpl<>(furnitureList.subList(start, end), pageable, furnitureList.size());
        return ResponseEntity.ok(resultPage);
    }

    @GetMapping("/furniture/colors")
    public ResponseEntity<?> getUniqueColors(@RequestParam List<String> categories) {
        try {
            List<ColorDTO> colors = furnitureService.getUniqueColorsByCategories(categories);
            return ResponseEntity.ok(colors);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error");
        }
    }

    @GetMapping("/furniture/sizes")
    public ResponseEntity<List<SizeDTO>> getUniqueSizes(@RequestParam List<String> categories) {
        List<SizeDTO> sizes = furnitureService.getUniqueSizesByCategories(categories);
        return ResponseEntity.ok(sizes);
    }

    @PostMapping("/favorites/add")
    public ResponseEntity<String> addFurnituresToFavorites(@RequestBody List<Long> furnitureIds, Principal principal) {
        try {
            String userId = principal.getName();
            String result = furnitureService.addToFavorites(
                Long.valueOf(userId), 
                furnitureIds
            );
            return ResponseEntity.ok(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Ошибка преобразования типов данных");
        }
    }

    @GetMapping("/favorites/getList")
    public ResponseEntity<?> getUserFavorites(Principal principal){
        String userId = principal.getName(); 
        List<FavoriteItemDTO> result = furnitureService.getUserFavoritesList(Long.valueOf(userId));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/cart/add")
    public ResponseEntity<String> addFurnituresToCart(@RequestBody List<Long> furnitureIds, Principal principal) {
        try {
            String userId = principal.getName();
            String result = furnitureService.addFurnitureToCart(
                Long.valueOf(userId), 
                furnitureIds
            );
            return ResponseEntity.ok(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Ошибка преобразования типов данных");
        }
    }

    @GetMapping("/checkStock/{idFurniture}")
    public ResponseEntity<?> furnitureIsInStock(@PathVariable String idFurniture) {
        try {
            FurnitureStockResponse result = furnitureService.furnitureIsInStock(Long.valueOf(idFurniture));
            return ResponseEntity.ok(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Ошибка преобразования типов данных"); 
        }
    }
    

    @GetMapping("/cart/getList")
    public ResponseEntity<?> getUserCart(Principal principal){
        String userId = principal.getName(); 
        List<CartItemDTO> result = furnitureService.getUserCartList(Long.valueOf(userId));
        return ResponseEntity.ok(result);
    }

    @PutMapping("/cart/updateQuantity")
    public ResponseEntity<String> updateCartItemQuantity(@RequestBody UpdateQuantityDTO updateDTO,Principal principal) {
        try {
            String userId = principal.getName();
            String result = furnitureService.updateCartItemQuantity(
                Long.valueOf(userId),
                updateDTO.getFurnitureId(),
                updateDTO.getNewQuantity()
            );
            return ResponseEntity.ok(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid data format");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating quantity: " + e.getMessage());
        }
    }

    @PutMapping("/cart/updateQuantity/bulk")
    public ResponseEntity<String> updateCartItemQuantities(
        @RequestBody BulkUpdateQuantityDTO bulkUpdateDTO, 
        Principal principal
    ) {
        try {
            String userId = principal.getName();
            for (UpdateQuantityDTO updateDTO : bulkUpdateDTO.getUpdates()) {
                furnitureService.updateCartItemQuantity(
                    Long.valueOf(userId),
                    updateDTO.getFurnitureId(),
                    updateDTO.getNewQuantity()
                );
            }
            return ResponseEntity.ok("Cart quantities updated successfully");
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid data format");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating cart quantities: " + e.getMessage());
        }
    }
}
