package com.example.furnitureStore.Controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import java.nio.file.Paths;

@RestController
public class ImageController {

    @GetMapping("/img/mainIMG/{imageName}")
    public ResponseEntity<Resource> getMainImage(@PathVariable String imageName) {
        try {
           
            String imagePath = "img/mainIMG/"+imageName;
            String fullPath = Paths.get(imagePath).toString();
            Resource resource = new FileSystemResource(fullPath);
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/img/hotelIMG/{imageName}")
    public ResponseEntity<Resource> getHotelImage(@PathVariable String imageName) {
        try {
           
            String imagePath = "img/hotelIMG/"+imageName;
            String fullPath = Paths.get(imagePath).toString();
            Resource resource = new FileSystemResource(fullPath);
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/img/users/{imageName}")
    public ResponseEntity<Resource> getUserImage(@PathVariable String imageName) {
        try {
           
            String imagePath = "img/users/"+imageName;
            String fullPath = Paths.get(imagePath).toString();
            Resource resource = new FileSystemResource(fullPath);
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



}

