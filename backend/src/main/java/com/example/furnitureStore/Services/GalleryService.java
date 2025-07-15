package com.example.furnitureStore.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.furnitureStore.DTO.GalleryDTO;
import com.example.furnitureStore.Entities.Gallery;
import com.example.furnitureStore.Repositories.GalleryRepository;
import com.example.furnitureStore.Utils.ImageUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GalleryService {

    @Autowired
    private GalleryRepository galleryRepository;
    @Autowired
    private ImageUtil imageUtil;

    
    public List<Gallery> getAllGalleries() {
        return galleryRepository.findAll();
    }

    public Gallery getGalleryById(Long id) {
        return galleryRepository.findById(id).get();
    }

    public Gallery createGallery(GalleryDTO gallery) {
        List<String> urls = new ArrayList<>();
        for(String url : gallery.getImageUrls()){
            urls.add(imageUtil.saveAllImage(url));
        }
        Gallery gallerySave = new Gallery(gallery.getName(), gallery.getType());
        gallerySave.setImageUrls(urls);

        return galleryRepository.save(gallerySave);
    }

    public Gallery updateGallery(Long id, Gallery galleryDetails) {
        Optional<Gallery> optionalGallery = galleryRepository.findById(id);
        if (optionalGallery.isPresent()) {
            Gallery existingGallery = optionalGallery.get();
            existingGallery.setName(galleryDetails.getName());
            existingGallery.setType(galleryDetails.getType());
            existingGallery.setImageUrls(galleryDetails.getImageUrls());
            return galleryRepository.save(existingGallery);
        } else {
           
            return null;
        }
    }

    public void deleteGallery(Long id) {
        galleryRepository.deleteById(id);
    }
}
