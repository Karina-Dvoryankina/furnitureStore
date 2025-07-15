package com.example.furnitureStore.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.furnitureStore.Configuration.JWTprovider;
import com.example.furnitureStore.DTO.CartItemDTO;
import com.example.furnitureStore.DTO.ChangeVolumeDTO;
import com.example.furnitureStore.DTO.ColorDTO;
import com.example.furnitureStore.DTO.FavoriteItemDTO;
import com.example.furnitureStore.DTO.FurnitureDTO;
import com.example.furnitureStore.DTO.FurnitureStockResponse;
import com.example.furnitureStore.DTO.SizeDTO;
import com.example.furnitureStore.DTO.TypeDTO;
import com.example.furnitureStore.Entities.Cart;
import com.example.furnitureStore.Entities.CartItems;
import com.example.furnitureStore.Entities.CartItemsId;
import com.example.furnitureStore.Entities.Favorite;
import com.example.furnitureStore.Entities.FavoriteItems;
import com.example.furnitureStore.Entities.FavoriteItemsId;
import com.example.furnitureStore.Entities.Furniture;
import com.example.furnitureStore.Entities.FurnitureColor;
import com.example.furnitureStore.Entities.Type;
import com.example.furnitureStore.Entities.User;
import com.example.furnitureStore.Repositories.CartItemsRepository;
import com.example.furnitureStore.Repositories.CartRepository;
import com.example.furnitureStore.Repositories.FavoriteItemsRepository;
import com.example.furnitureStore.Repositories.FavoriteRepository;
import com.example.furnitureStore.Repositories.FurnitureColorRepository;
import com.example.furnitureStore.Repositories.FurnitureRepository;
import com.example.furnitureStore.Repositories.TypeRepository;
import com.example.furnitureStore.Repositories.UserRepository;
import com.example.furnitureStore.Utils.ImageUtil;

import jakarta.persistence.EntityNotFoundException;

import java.math.BigDecimal;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.ToLongBiFunction;
import java.util.stream.Collectors;

@Service
public class FurnitureService {
    @Autowired
    private FurnitureRepository furnitureRepository;
    @Autowired
    private ImageUtil imageUtil;
    @Autowired
    private TypeRepository typeRepository;
    @Autowired
    private FurnitureColorRepository furnitureColorRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FavoriteRepository favoriteRepository;
    @Autowired
    private FavoriteItemsRepository favoriteItemsRepository;
    @Autowired
    private JWTprovider jwTprovider;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartItemsRepository cartItemsRepository;

    public List<Furniture> getAllFurniture() {
        List<Furniture> furnitureList = furnitureRepository.findAll().stream().filter(fur -> fur.getVolume() != 0)
                .collect(Collectors.toList());

        return furnitureList;
    }

    public Optional<Furniture> getFurnitureById(Long id) {
        return furnitureRepository.findById(id);
    }

    public boolean isArticleExists(String article) {
        return furnitureRepository.existsByArticle(article);
    }

    public Furniture saveFurniture(FurnitureDTO furnitureDTO) {
        Long typeId = furnitureDTO.getType().getId();

        // Проверяем существование категории
        Type type = typeRepository.findById(typeId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Указанная категория не существует"));

        // Проверяем, существует ли товар с таким же артикулом
        if (furnitureRepository.existsByArticle(furnitureDTO.getArticle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Товар с указанным артикулом уже существует");
        }

        // Создаем объект Furniture из FurnitureDTO
        Furniture furniture = new Furniture();
        furniture.setName(furnitureDTO.getName());
        furniture.setWidth(furnitureDTO.getWidth());
        furniture.setHeight(furnitureDTO.getHeight());
        furniture.setDepth(furnitureDTO.getDepth());
        furniture.setFirm(furnitureDTO.getFirm());
        furniture.setType(type);
        furniture.setPrice(new BigDecimal(furnitureDTO.getPrice().toString()));
        furniture.setTime(furnitureDTO.getTime());
        furniture.setVolume(furnitureDTO.getVolume());
        furniture.setArticle(furnitureDTO.getArticle());
        furniture.setDescription(furnitureDTO.getDescription());

        // Создаем список изображений
        List<String> images = new ArrayList<>();
        if (furnitureDTO.getImageUrls() != null) {
            for (String url : furnitureDTO.getImageUrls()) {
                images.add(imageUtil.saveUserImage(url));
            }
            furniture.setImages(images);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Список изображений товара пуст");
        }

        // Дополнительные установки
        furniture.setRating(0L);
        furniture.setSold(0L);

        // Сохраняем мебель
        Furniture savedFurniture = furnitureRepository.save(furniture);

        // Создаем список цветов после сохранения мебели
        if (furnitureDTO.getColors() != null) {
            List<FurnitureColor> furnitureColors = furnitureDTO.getColors().stream()
                    .map(colorDTO -> new FurnitureColor(savedFurniture, colorDTO.getColorName(),
                            colorDTO.getColorHex()))
                    .collect(Collectors.toList());

            // Сохраняем каждый объект FurnitureColor в базе данных
            furnitureColorRepository.saveAll(furnitureColors);

            // Связываем цвета с объектом Furniture
            savedFurniture.setColors(furnitureColors);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Список доступных цветов товара пуст");
        }

        return savedFurniture;
    }

    public void deleteFurnitureByArticle(String article) {
        Furniture furniture = furnitureRepository.findByArticle(article)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Furniture with article " + article + " not found"));

        imageUtil.deleteImages(furniture.getImages(), "D:\\Новая папка\\вост\\вёрстка\\img\\furniture\\");

        furnitureRepository.delete(furniture);
    }

    public void deleteFurniture(Long id) {
        furnitureRepository.deleteById(id);
    }

    public List<Furniture> getFurnitureByTypes(List<String> types) {
        return furnitureRepository.findByType_NameIn(types);
    }

    // Метод для сортировки по рейтингу
    public List<Furniture> sortByRating(List<Furniture> furnitures) {
        return furnitures.stream()
                .sorted(Comparator.comparingLong(Furniture::getRating).reversed())
                .collect(Collectors.toList());
    }

    // Метод для сортировки по популярности
    public List<Furniture> sortByPopularity(List<Furniture> furnitures) {
        return furnitures.stream()
                .sorted(Comparator.comparingLong(Furniture::getSold).reversed())
                .collect(Collectors.toList());
    }

    // Метод для сортировки по цене (по возрастанию)
    public List<Furniture> sortByPriceAsc(List<Furniture> furnitures) {
        return furnitures.stream()
                .sorted(Comparator.comparing(Furniture::getPrice))
                .collect(Collectors.toList());
    }

    // Метод для сортировки по цене (по убыванию)
    public List<Furniture> sortByPriceDesc(List<Furniture> furnitures) {
        return furnitures.stream()
                .sorted(Comparator.comparing(Furniture::getPrice).reversed())
                .collect(Collectors.toList());
    }

    // Метод для сортировки по дате создания (новинки в начале)
    public List<Furniture> sortByCreationTime(List<Furniture> furnitures) {
        return furnitures.stream()
                .sorted(Comparator.comparing(Furniture::getTime).reversed())
                .collect(Collectors.toList());
    }

    // Метод для фильтрации по цвету
    public List<Furniture> filterByColor(List<Furniture> furnitureList, List<String> requestedColors) {
        return furnitureList.stream()
                .filter(furniture -> {
                    List<String> furnitureColors = furniture.getColors().stream()
                            .map(FurnitureColor::getColorName)
                            .collect(Collectors.toList());
                    return requestedColors.stream().anyMatch(furnitureColors::contains);
                })
                .collect(Collectors.toList());
    }

    // Метод для фильтрации по цене
    public List<Furniture> filterByPrice(List<Furniture> furnitures, BigDecimal priceLow, BigDecimal priceHigh) {
        return furnitures.stream()
                .filter(furniture -> furniture.getPrice().compareTo(priceLow) >= 0 &&
                        furniture.getPrice().compareTo(priceHigh) <= 0)
                .collect(Collectors.toList());
    }

    // Метод для фильтрации по размеру
    public List<Furniture> filterBySize(List<Furniture> furnitureList, List<String> requestedSizes) {
        return furnitureList.stream()
                .filter(furniture -> {
                    return requestedSizes.stream().anyMatch(size -> {
                        String[] dimensions = size.split("x");
                        double width = Double.parseDouble(dimensions[0]);
                        double height = Double.parseDouble(dimensions[1]);
                        double depth = Double.parseDouble(dimensions[2]);
                        return furniture.getWidth() == width && furniture.getHeight() == height
                                && furniture.getDepth() == depth;
                    });
                })
                .collect(Collectors.toList());
    }

    public Furniture changeRating(Long furnitureId) {
        Furniture furniture = furnitureRepository.findById(furnitureId).get();
        Long rating = furniture.getRating() + 1;
        furniture.setRating(rating);
        return furnitureRepository.save(furniture);
    }

    public Furniture changeVolume(ChangeVolumeDTO volume) {
        Furniture furniture = furnitureRepository.findById(volume.getFurnitureId()).get();
        long volumeNew = furniture.getVolume() + volume.getVolume();
        furniture.setVolume(volumeNew);
        return furnitureRepository.save(furniture);
    }

    public String buyFurniture(List<Long> furnitures) {
        List<Furniture> furniture = new ArrayList<>();

        for (Long i : furnitures) {
            Furniture findFurniture = furnitureRepository.findById(i).get();
            furniture.add(findFurniture);
        }
        for (Furniture f : furniture) {
            Long sold = f.getSold();
            System.out.println(sold);
            f.setSold(sold + 1);

            Long volume = f.getVolume();
            System.out.println(volume);
            f.setVolume(volume - 1);

            furnitureRepository.save(f);
        }

        return "Покупка совершена успешно";
    }

    // Метод для преобразования Furniture в FurnitureDTO

    private FurnitureDTO toDTO(Furniture furniture) {
        FurnitureDTO dto = new FurnitureDTO();
        dto.setName(furniture.getName());
        dto.setWidth(furniture.getWidth());
        dto.setHeight(furniture.getHeight());
        dto.setDepth(furniture.getDepth());
        dto.setFirm(furniture.getFirm());
        dto.setColors(furniture.getColors().stream()
                .map(color -> new ColorDTO(color.getColorName(), color.getColorHex()))
                .collect(Collectors.toList()));
        dto.setPrice(furniture.getPrice());
        dto.setImageUrls(furniture.getImages());
        dto.setTime(furniture.getTime());
        dto.setVolume(furniture.getVolume());
        dto.setArticle(furniture.getArticle());
        dto.setDescription(furniture.getDescription());

        // Преобразуем Type в TypeDTO
        if (furniture.getType() != null) {
            TypeDTO typeDTO = new TypeDTO();
            typeDTO.setId(furniture.getType().getId());
            typeDTO.setName(furniture.getType().getName());
            dto.setType(typeDTO);
        }

        return dto;
    }

    // Метод для поиска мебели по названию или артикулу
    public List<FurnitureDTO> searchFurniture(String query) {
        List<Furniture> furnitures = furnitureRepository.findAll(); // Получаем все данные

        String lowerCaseQuery = query.toLowerCase();

        return furnitures.stream()
                .map(this::toDTO) // Преобразуем каждый объект Furniture в FurnitureDTO
                .filter(furnitureDTO -> {
                    // Проверка полного совпадения артикула
                    boolean matchesArticle = furnitureDTO.getArticle().toLowerCase().equals(lowerCaseQuery);

                    // Проверка совпадения названия при условии, что запрос содержит 4 или более
                    // букв
                    boolean matchesName = lowerCaseQuery.length() >= 4 &&
                            furnitureDTO.getName().toLowerCase().contains(lowerCaseQuery);

                    return matchesArticle || matchesName;
                })
                .collect(Collectors.toList());
    }

    public List<ColorDTO> getUniqueColorsByCategories(List<String> categories) {
        // 1. Получить список мебели по категориям
        List<Furniture> furnitureList = getFurnitureByTypes(categories);

        // 2. Извлечь уникальные идентификаторы мебели
        List<Long> furnitureIds = furnitureList.stream()
                .map(Furniture::getId)
                .distinct()
                .collect(Collectors.toList());

        // 3. Получить уникальные цвета по идентификаторам мебели
        List<FurnitureColor> furnitureColors = furnitureColorRepository.findDistinctByIdFurnitureIn(furnitureIds);

        // 4. Собрать уникальные цвета
        Map<String, ColorDTO> colorMap = new HashMap<>();
        for (FurnitureColor furnitureColor : furnitureColors) {
            if (!colorMap.containsKey(furnitureColor.getColorName())) {
                colorMap.put(furnitureColor.getColorName(),
                        new ColorDTO(furnitureColor.getColorName(), furnitureColor.getColorHex()));
            }
        }

        // 5. Возвращаем список уникальных цветов
        return new ArrayList<>(colorMap.values());
    }

    public List<SizeDTO> getUniqueSizesByCategories(List<String> categories) {
        // 1. Получить список мебели по категориям
        List<Furniture> furnitureList = furnitureRepository.findByType_NameIn(categories);

        // 2. Собрать уникальные размеры
        Map<SizeDTO, SizeDTO> sizeMap = new HashMap<>();
        for (Furniture furniture : furnitureList) {
            SizeDTO size = new SizeDTO(furniture.getWidth(), furniture.getHeight(), furniture.getDepth());
            sizeMap.putIfAbsent(size, size);
        }

        // 3. Преобразовать Map в List
        List<SizeDTO> sizes = new ArrayList<>(sizeMap.values());

        // 4. Отсортировать по убыванию относительно width
        sizes.sort(Comparator.comparingDouble(SizeDTO::getWidth).reversed());

        // 5. Возвращаем отсортированный список уникальных размеров
        return sizes;
    }

    User FindUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));
    }
    
    Furniture FindFurniture(Long furnitureId) {
        return furnitureRepository.findById(furnitureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Товар не найден"));
    }
    
    Cart FindCart (User user){
        return cartRepository.findByUser(user)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Корзина не найдена"));
    }
    
    @Transactional
    public String addToFavorites(Long userId, List<Long> furnitureIds) {
        // Найти пользователя
        User user = FindUser(userId);
        
        // Найти или создать запись в таблице "favorites" для пользователя
        Favorite favorite = favoriteRepository.findByUser(user)
                .orElseGet(() -> {
                    Favorite newFavorite = new Favorite();
                    newFavorite.setUser(user);
                    return favoriteRepository.save(newFavorite);
                });
        
        // Получить все текущие избранные товары пользователя
        List<FavoriteItems> existingItems = favoriteItemsRepository.findByFavoriteUser(user);
        Set<Long> existingFurnitureIds = existingItems.stream()
                .map(item -> item.getFurniture().getId())
                .collect(Collectors.toSet());
        
        // Обработать каждый переданный ID товара
        int addedCount = 0;
        int removedCount = 0;
        
        for (Long furnitureId : furnitureIds) {
            Furniture furniture = FindFurniture(furnitureId);
            
            if (existingFurnitureIds.contains(furnitureId)) {
                // Удаляем из избранного, если уже есть
                favoriteItemsRepository.deleteByFavoriteAndFurniture(favorite, furniture);
                removedCount++;
                existingFurnitureIds.remove(furnitureId);
            } else {
                // Добавляем в избранное
                FavoriteItems favoriteItem = new FavoriteItems();
                FavoriteItemsId favoriteItemsId = new FavoriteItemsId(
                    favorite.getIdFavorites(), 
                    furniture.getId()
                );
                favoriteItem.setId(favoriteItemsId);
                favoriteItem.setFavorite(favorite);
                favoriteItem.setFurniture(furniture);
                favoriteItemsRepository.save(favoriteItem);
                addedCount++;
                existingFurnitureIds.add(furnitureId);
            }
        }
        
        return String.format(
            "Обработано %d товаров: добавлено %d, удалено %d",
            furnitureIds.size(), 
            addedCount, 
            removedCount
        );
    }

    public List<FavoriteItemDTO> getUserFavoritesList(Long userId) {
        // Найти пользователя
        User user = FindUser(userId);

        // Найти избранное пользователя
        Optional<Favorite> favoriteOptional = favoriteRepository.findByUser(user);

        if (favoriteOptional.isEmpty()) {
            return Collections.emptyList();
        }

        Favorite favorite = favoriteOptional.get();

        // Получить список товаров из избранного
        List<FavoriteItems> favoriteItems = favoriteItemsRepository.findAllByFavorite(favorite);

        if (favoriteItems.isEmpty()) {
            return Collections.emptyList();
        }

        return favoriteItems.stream()
        .map(item -> {
            Furniture furniture = item.getFurniture();
            return new FavoriteItemDTO(
                furniture.getId(),
                "synced",
                "server"
            );
        })
        .collect(Collectors.toList());
    }
    

    @Transactional
    public String addFurnitureToCart(Long userId, List<Long> furnitureIds) {
        // Найти пользователя
        User user = FindUser(userId);
        
        // Найти или создать корзину пользователя
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setTotalQuanity(0);
                    newCart.setTotalPrice(BigDecimal.ZERO);
                    return cartRepository.save(newCart);
                });
        
        // Получить все текущие товары в корзине пользователя
        List<CartItems> existingItems = cartItemsRepository.findByCartUser(user);
        Map<Long, CartItems> existingItemsMap = existingItems.stream()
                .collect(Collectors.toMap(
                    item -> item.getFurniture().getId(),
                    item -> item
                ));
        
        // Обработать каждый переданный ID товара
        int addedCount = 0;
        int removedCount = 0;
        int totalQuantity = cart.getTotalQuanity();
        BigDecimal totalPrice = cart.getTotalPrice();
        
        for (Long furnitureId : furnitureIds) {
            Furniture furniture = FindFurniture(furnitureId);
            
            if (existingItemsMap.containsKey(furnitureId)) {
                // Удаляем из корзины, если уже есть
                CartItems existingItem = existingItemsMap.get(furnitureId);
                cartItemsRepository.delete(existingItem);
                removedCount++;
                
                // Обновляем общие значения корзины
                totalQuantity -= existingItem.getQuanity();
                totalPrice = totalPrice.subtract(
                    existingItem.getPrice().multiply(BigDecimal.valueOf(existingItem.getQuanity()))
                );
            } else {
                // Добавляем в корзину
                CartItems cartItem = new CartItems();
                CartItemsId cartItemsId = new CartItemsId(cart.getIdCart(), furniture.getId());
                cartItem.setId(cartItemsId);
                cartItem.setCart(cart);
                cartItem.setQuanity(1);
                cartItem.setPrice(furniture.getPrice());
                cartItem.setFurniture(furniture);
                cartItemsRepository.save(cartItem);
                addedCount++;
                
                // Обновляем общие значения корзины
                totalQuantity += 1;
                totalPrice = totalPrice.add(furniture.getPrice());
            }
        }
        
        // Обновляем корзину
        cart.setTotalQuanity(totalQuantity);
        cart.setTotalPrice(totalPrice);
        cartRepository.save(cart);
        
        return String.format(
            "Обработано %d товаров: добавлено %d, удалено %d",
            furnitureIds.size(), 
            addedCount, 
            removedCount
        );
    }


    public List<CartItemDTO> getUserCartList(Long userId) {
        // Найти пользователя
        User user = FindUser(userId);

        // Найти корзину пользователя
        // Optional<Cart> cartOptional = cartRepository.findByUser(user);

        // if (cartOptional.isEmpty()) {
        //     return Collections.emptyList();
        // }

        // Cart cart = cartOptional.get();
        Cart cart = FindCart(user);

        // Получить список товаров из корзины
        List<CartItems> cartItems = cartItemsRepository.findAllByCart(cart);

        if (cartItems.isEmpty()) {
            return Collections.emptyList();
        }

        return cartItems.stream()
        .map(item -> {
            Furniture furniture = item.getFurniture();
            return new CartItemDTO(
                furniture.getId(),
                "synced",
                "server",
                item.getQuanity(),
                item.getPrice()
            );
        })
        .collect(Collectors.toList());
    }

    public FurnitureStockResponse furnitureIsInStock(Long furnitureId) {
        Furniture furniture = FindFurniture(furnitureId);
        boolean inStock = furniture.getVolume() > 0;
        return new FurnitureStockResponse(inStock, furniture.getVolume());
    }

    public String updateCartItemQuantity(Long userId, Long furnitureId, Integer newQuantity) {
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("Количество товаров должно быть положительным");
        }

        // Находим корзину пользователя и корзину 
        // Cart cart = cartRepository.findByUser(userRepository.findById(userId)
        //     .orElseThrow(() -> new EntityNotFoundException("User not found")))
        //     .orElseThrow(() -> new EntityNotFoundException("Cart not found"));

        User user = FindUser(userId);
        Cart cart = FindCart(user);

        // Находим конкретный товар в корзине
        CartItems cartItem = cartItemsRepository.findById(new CartItemsId(cart.getIdCart(), furnitureId))
            .orElseThrow(() -> new EntityNotFoundException("Item not found in cart"));

        // Получаем текущее количество и цену
        int oldQuantity = cartItem.getQuanity();
        BigDecimal itemPrice = cartItem.getPrice();

        // Обновляем количество в элементе корзины
        cartItem.setQuanity(newQuantity);
        cartItemsRepository.save(cartItem);

        // Обновляем общие значения корзины
        Cart userCart = cartItem.getCart();
        userCart.setTotalQuanity(userCart.getTotalQuanity() - oldQuantity + newQuantity);
        userCart.setTotalPrice(userCart.getTotalPrice()
            .subtract(itemPrice.multiply(BigDecimal.valueOf(oldQuantity)))
            .add(itemPrice.multiply(BigDecimal.valueOf(newQuantity))));
        cartRepository.save(userCart);

        return "Количество товаров в корзине успешно обновлено";
    }

	@Transactional
    public void clearUserCart(User user) {
        try {
            Cart cart = FindCart(user);
            cartItemsRepository.deleteByCart(cart);  
            cartRepository.save(cart); 
        } catch (Exception e) {
            throw new RuntimeException("Не удалось очистить корзину", e);
        }
    }

}
