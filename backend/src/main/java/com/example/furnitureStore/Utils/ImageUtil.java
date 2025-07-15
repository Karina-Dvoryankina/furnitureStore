package com.example.furnitureStore.Utils;


import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
// import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Component;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Component
public class ImageUtil {
   

    public  String saveImage(MultipartFile file, String path) throws IOException {
        if (file != null && !file.isEmpty()) {
            String fileName = StringUtils.cleanPath(file.getOriginalFilename());
            fileName = System.currentTimeMillis() + "-" + fileName; 
            File uploadDir = new File(path);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();}

            Path filePath = Paths.get(path + File.separator + fileName);
            Files.copy(file.getInputStream(), filePath);
            return fileName; 
        } else {
            throw new IllegalArgumentException("Uploaded file is empty or null.");
        }
    }

    public void deleteImages(List<String> imageUrls, String imagePath) {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (String imageUrl : imageUrls) {
                try {
                    // Извлекаем имя файла из URL
                    String fileName = Paths.get(imageUrl).getFileName().toString();
                    deleteImage(fileName, imagePath);
                } catch (IOException e) {
                    // Логируем ошибку при удалении изображения
                    System.err.println("Failed to delete image: " + imageUrl + ". Error: " + e.getMessage());
                }
            }
        }
    }    


    public  void deleteImage(String fileName, String path) throws IOException {
        Path imagePath = Paths.get(path + File.separator + fileName);
        Files.deleteIfExists(imagePath);
    }


    public String saveMainImage(String mainImg) {
        String base64ImageString = mainImg.split(",")[1];
        byte[] imageBytes = Base64.getDecoder().decode(base64ImageString);
        String uniqueFileName = UUID.randomUUID().toString() + ".jpg";
        String uploadPath = "img/mainIMG/";
        
        try {
            Files.createDirectories(Paths.get(uploadPath));
            Path filePath = Paths.get(uploadPath, uniqueFileName);
            Files.write(filePath, imageBytes);
            System.out.println("Файл успешно записан на диск: " + filePath);
            return filePath.toString();
        } catch (IOException e) {
            System.err.println("Не удалось записать файл на диск: " + e.getMessage());
            return null;
        }
    }
    


    public String saveAllImage(String file) {
        String base64ImageString = file.split(",")[1];
        byte[] imageBytes = Base64.getDecoder().decode(base64ImageString);
        String uniqueFileName = UUID.randomUUID().toString() + ".jpg";
        String uploadPath = "img/hotelIMG/";
    
        try {
            Files.createDirectories(Paths.get(uploadPath));
            Path filePath = Paths.get(uploadPath, uniqueFileName);
            Files.write(filePath, imageBytes);
            System.out.println("Файл успешно записан на диск: " + filePath);
            return filePath.toString();
        } catch (IOException e) {
            System.err.println("Не удалось записать файл на диск: " + e.getMessage());
            return null;
        }
    }
    

    public String saveUserImage(String imageUrl) {
        String uploadPath = "D:\\Новая папка\\вост\\вёрстка\\img\\furniture\\";
        Path path = Paths.get(uploadPath);
        
        try {
            Files.createDirectories(path);
            System.out.println("Папка создана или уже существует: " + path);
        } catch (IOException e) {
            System.err.println("Не удалось создать папку: " + e.getMessage());
            return null;
        }

        String uniqueFileName = UUID.randomUUID().toString() + ".jpg";
        String filePath = uploadPath + uniqueFileName;

        try {
            // Загружаем изображение с URL
            URL url = new URL(imageUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setDoOutput(true);
            connection.connect();

            // Проверяем ответ сервера
            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                System.err.println("Ошибка при загрузке изображения: " + connection.getResponseMessage());
                return null;
            }

            // Читаем данные изображения
            try (InputStream in = connection.getInputStream()) {
                Files.copy(in, Paths.get(filePath));
                System.out.println("Файл успешно записан на диск: " + filePath);
            }
        } catch (IOException e) {
            System.err.println("Не удалось загрузить и сохранить изображение: " + e.getMessage());
            return null;
        }

        return "/img/furniture/" + uniqueFileName;
    }


}


