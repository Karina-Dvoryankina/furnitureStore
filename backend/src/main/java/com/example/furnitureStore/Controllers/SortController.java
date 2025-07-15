package com.example.furnitureStore.Controllers;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.furnitureStore.DTO.SizeDTO;
import com.example.furnitureStore.DTO.SortByPriceDTO;
import com.example.furnitureStore.DTO.SortBySizeDTO;
import com.example.furnitureStore.DTO.SortColorDTO;
import com.example.furnitureStore.Entities.Furniture;
import com.example.furnitureStore.Entities.Type;
import com.example.furnitureStore.Services.FurnitureService;

@RestController
public class SortController {
    @Autowired
    private FurnitureService furnitureService;


    @PostMapping("/sort-by-rating")
    public List<Furniture> sortByRating(@RequestBody List<Furniture> furnitures) {
        return furnitureService.sortByRating(furnitures);
    }
    
    @PostMapping("/sort-by-popularity")
    public List<Furniture> sortByPopularity(@RequestBody List<Furniture> furnitures) {
        return furnitureService.sortByPopularity(furnitures);
    }
    
    // Сортировка по цене (возрастание)
    @PostMapping("/sort-by-price-asc")
    public List<Furniture> sortByPriceAsc(@RequestBody List<Furniture> furnitures) {
        return furnitureService.sortByPriceAsc(furnitures);
    }
    
    // Сортировка по цене (убывание)
    @PostMapping("/sort-by-price-desc")
    public List<Furniture> sortByPriceDesc(@RequestBody List<Furniture> furnitures) {
        return furnitureService.sortByPriceDesc(furnitures);
    }
    
    @PostMapping("/sort-by-creation-time")
    public List<Furniture> sortByCreationTime(@RequestBody List<Furniture> furnitures) {
        return furnitureService.sortByCreationTime(furnitures);
    }
    
    @PostMapping("/sort-by-color")
    public List<Furniture> sortByColor(@RequestBody List<Furniture> furnitures, List<String> targetColors) {
        return furnitureService.filterByColor(furnitures,targetColors);
    }
    
    @PostMapping("/sort-by-price")
    public List<Furniture> sortByPrice(@RequestBody List<Furniture> furnitures, BigDecimal priceLow, BigDecimal priceHigh) {
        return furnitureService.filterByPrice(furnitures,priceLow,priceHigh);
    }
    
    // @PostMapping("/sort-by-size")
    // public List<Furniture> sortBySize(@RequestBody List<Furniture> furnitures, List<SizeDTO> sizes) {
    //     return furnitureService.filterBySize(furnitures,sizes);
    // }

    
}
