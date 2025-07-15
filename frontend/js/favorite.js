import {LoginAddEventListner,getCachedFurniture,HEART_STORAGE_KEY,CART_STORAGE_KEY,addAuthStateListener,responseProcessingSync, displayCountsHeader,createFurnitureCard, handleBuyClick, saveCart, getUserIsAuth, getCart, isCartItem, getFurnitureById, getCartLocal} from './module.js';
import { checkAuth } from './auth.js';
document.addEventListener('DOMContentLoaded', async function (){

    checkAuth();

    addAuthStateListener((isAuth) => {
        if (!isAuth && (window.location.pathname.includes('basket.html') || 
                       window.location.pathname.includes('favorite.html'))) {
            window.location.href = 'index.html';
        }
    });

    //border header
    const nav = document.querySelector('nav');
    nav.classList.add('fixed_border');

    //обработчик клика кнопки перейти в корзину
    document.querySelector('.action_basket').addEventListener('click', function (){
        window.location.href = 'basket.html';
    });

    // Клик на кнопку войти
    const voitiClick = document.querySelector('.voiti_click');
    LoginAddEventListner(voitiClick);

    //выводим счетчики количества товаров в шапке для избранного и корзины
    displayCountsHeader(HEART_STORAGE_KEY);
    displayCountsHeader(CART_STORAGE_KEY);

    //вывод избранных товаров
    const resultsContainer = document.querySelector('.furniture_list');
    let Favorites = await getCart(HEART_STORAGE_KEY);
    console.log(Favorites);

    if (Favorites.length > 0) {
        // let furniturePromises = Favorites.map(IdElement => getFurnitureById(IdElement.id));
        const furniturePromises = Favorites.map(item => {
            const cached = getCachedFurniture(item.id);
            return cached ? Promise.resolve(cached) : getFurnitureById(item.id);
        });
        console.log(furniturePromises);

        Promise.all(furniturePromises)
            .then(furnitureList => {
                console.log('Все товары загружены:', furnitureList);
                DisplayFurnitureFavorites(furnitureList, resultsContainer);
            })
            .catch(error => {
                console.error('Ошибка при загрузке товаров:', error);
            });
    }
    else {
        document.querySelector('.empty').textContent = 'Добавьте товары в избранное!';
    }
    
    
});


//функция для отображения карточек товаров
export async function DisplayFurnitureFavorites(listFurniture,resultContainer){

    if (listFurniture.length === 0) {
        resultContainer.innerHTML = '<p>Список пуст</p>';
        return;
    }

    const heartList = await getCart(HEART_STORAGE_KEY);
    const basketList = await getCart(CART_STORAGE_KEY);

    const furnitureWithCache = listFurniture.map(furniture => {
        const cached = getCachedFurniture(furniture.id);
        return cached || furniture; 
    });

    furnitureWithCache.forEach(furniture => {
        const card = createFurnitureCard(furniture, heartList, basketList, {
            onHeartClick: handleRemoveHeartClick,
            onBuyClick: handleBuyClick,
        });
        resultContainer.appendChild(card);
    });
}


// Обработчик клика на крестик (удаление товара из избранного)
async function handleRemoveHeartClick(furniture, cardElement) {
    console.log(furniture,cardElement);
    
    // Получаем текущий список товаров в корзине
    let favorite = await getCart(HEART_STORAGE_KEY);
    console.log(favorite);

    const itemId = furniture.id; // Уникальный идентификатор товара

    // Проверяем, есть ли товар в корзине
    const isFavorite = isCartItem(itemId, favorite);
    console.log(isFavorite);

    //проверка авторизации пользователя
    console.log(getUserIsAuth());

    if (isFavorite) {
        
        // if (getUserIsAuth()){
        //     FurnitureToFavorite(itemId)
        //     .then(data => {
        //         alert(data.message); 
        //         displayCountsHeader('heart');
        //     });
        // } 
    
        favorite = favorite.filter(item => item.id !== itemId);
        console.log(favorite);
        saveCart(favorite, HEART_STORAGE_KEY); 
        cardElement.remove();
        displayCountsHeader(HEART_STORAGE_KEY);
        
        // Асинхронная синхронизация с сервером
        console.log(getUserIsAuth());
        if (getUserIsAuth()) {
            responseProcessingSync(favorite,itemId,HEART_STORAGE_KEY);
        }
    }
}