package com.example.furnitureStore.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.furnitureStore.DTO.GalleryDTO;
import com.example.furnitureStore.Entities.Gallery;
import com.example.furnitureStore.Services.GalleryService;

@RestController
public class GalleryController {

    @Autowired
    private GalleryService galleryService;

    
    @PostMapping("/galleries/add")
    public ResponseEntity<Gallery> createGallery(@RequestBody GalleryDTO gallery) {
        Gallery savedGallery = galleryService.createGallery(gallery);
        return new ResponseEntity<>(savedGallery, HttpStatus.CREATED);
    }

    @GetMapping("/galleries/list")
    public ResponseEntity<List<Gallery>> getAllGalleries() {
        List<Gallery> galleries = galleryService.getAllGalleries();
        return new ResponseEntity<>(galleries, HttpStatus.OK);
    }
    
    @GetMapping("/galleries/{id}")
    public ResponseEntity<Gallery> getGalleryById(@PathVariable Long id) {
        Gallery gallery = galleryService.getGalleryById(id);
        if (gallery != null) {
            return new ResponseEntity<>(gallery, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
