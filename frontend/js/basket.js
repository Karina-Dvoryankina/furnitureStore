import {LoginAddEventListner, handleOutOfStock,createColorOptions,calcTotalSumCart,cartIdsSet,getGoodsWord,addAuthStateListener,request, furnitureIsStock,handleColorClick, HEART_STORAGE_KEY,CART_STORAGE_KEY, getSelectedColor, responseProcessingSync, getFurnitureById, getUserIsAuth, svgIcons, createElement, displayCountsHeader, getCart, saveCart, isCartItem, handleHeartClick, UpdateCart, getCartLocal, getCachedFurniture} from './module.js';
import { checkAuth } from './auth.js';
import { openFurnitureModal } from './modal.js';
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

    //обработчик клика кнопки перейти в избранное
    document.querySelector('.action_heart').addEventListener('click', function (){
        window.location.href = 'favorite.html';
    });

    // Клик на кнопку войти
    const voitiClick = document.querySelector('.voiti_click');
    LoginAddEventListner(voitiClick);
     

    //выводим счетчики количества товаров в шапке для избранного и корзины
    displayCountsHeader(HEART_STORAGE_KEY);
    displayCountsHeader(CART_STORAGE_KEY);

    //вывод товаров добавленных в корзину
    showАddedToCart();


    //перейти к оформлению
    const buttonOform = document.querySelector('.buttonNextOform');
    buttonOform.addEventListener('click', async function (){
        try {
            // 1. Проверка авторизации
            if (!getUserIsAuth()) {
                sessionStorage.setItem('returnUrl', window.location.href);
                window.location.href = '/vhod.html?redirect=checkout';
                return;
            }
            
            // 2. Получаем корзину
            const cart = await getCartLocal(CART_STORAGE_KEY);
            
            // 3. Проверка пустой корзины
            if (cart.length <= 0) {
                alert('Добавьте товары в корзину');
                return;
            }
            
            // 4. Проверка наличия всех товаров
            const allAvailable = cart.every(item => {
                const furniture = getCachedFurniture(item.id);
                return furniture && furniture.volume >= item.quantity;
            });
            
            if (!allAvailable) {
                alert('Некоторые товары стали недоступны. Обновите корзину');
                await showАddedToCart(); 
                return;
            }

            //5. Фиксируем цену товара и выбранный цвет
            cart.map(item => {
                const furnitureCache = getCachedFurniture(item.id);
                item['price'] = furnitureCache.price;
                const colorIndex = getSelectedColor(item.id)
                item['color'] = furnitureCache.colors[colorIndex].colorName;
                console.log(item);
            });
            saveCart(cart,CART_STORAGE_KEY);

            
            // 6. Синхронизация количества товаров с сервером
            const syncSuccess = await updateQuantityWithServer(cart);
            // if (!syncSuccess) {
            //     alert('Не удалось синхронизировать корзину с сервером');
            //     return;
            // }
            
            window.location.href = '/order.html';
            
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
        // alert('Заказ успешно оформлен!');
        // localStorage.removeItem(CART_STORAGE_KEY);
    })
});

async function updateQuantityWithServer(cart){

     // Подготавливаем данные для отправки
    const updates = cart.map(item => ({
        furnitureId: item.id,
        newQuantity: item.quantity
    }));
    console.log({ updates });

    try {
        const result = await request('/api/cart/updateQuantity/bulk', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            data: { updates }
        });
        console.log(result);
    } catch (e) {
        console.error('Ошибка синхронизации корзины:', error);
    }
}

export async function showАddedToCart(){
    const resultsContainer = document.querySelector('.furniture_list');
    let cartItems = await getCart(CART_STORAGE_KEY);
    
    console.log(cartItems);

    if (cartItems.length > 0) {
        resultsContainer.closest('.basket_conteiner').style.display = 'flex';
        document.querySelector('.h1').textContent = 'Корзина';

        const furniturePromises = cartItems.map(item => {
            const cached = getCachedFurniture(item.id);
            return cached ? Promise.resolve(cached) : getFurnitureById(item.id);
        });

        Promise.all(furniturePromises)
            .then(furnitureList => {
                console.log('Все товары загружены:', furnitureList);
                DisplayFurnitureBasket(furnitureList, resultsContainer);
            })
            .catch(error => {
                console.error('Ошибка при загрузке товаров:', error);
            });
    } else {
        resultsContainer.closest('.basket_conteiner').style.display = 'none';
        document.querySelector('.h1').textContent = 'Добавьте товары в корзину!';
    }
}

async function DisplayFurnitureBasket(listFurniture, resultContainer){
    console.log(listFurniture.length);
    if (listFurniture.length !== 0) {

        const favorite = await getCart(HEART_STORAGE_KEY);
        const cart = getCartLocal(CART_STORAGE_KEY);

        listFurniture.forEach((furniture,index) => {

            const card = createElement('a', 'tovar_card');
            card.dataset.id = furniture.id; 

            card.addEventListener('click', (e)=>{
                if (e.target.closest(`.${HEART_STORAGE_KEY}`) ||
                    e.target.closest('.furniture_color') ||
                    e.target.closest('.stepper')) return;
                openFurnitureModal(furniture.id);
            });

            const furniture_img = createElement('img', '', { 
                src: furniture.images[0],
                alt: furniture.name
            });

            const div_info = createElement('div', 'div_info');

            const p_name = createElement('p', 'furniture_name', { 
                textContent: furniture.name 
            });

            const p_size = createElement('p', 'furniture_size');
            const size_text = createElement('span', '', { 
                textContent: `${furniture.width} x ${furniture.height} x ${furniture.depth}` 
            });
            const icon_size = createElement('span', 'icon_size', { 
                innerHTML: svgIcons.size 
            });

            const div_color = createColorOptions(furniture);

            const div_action = createElement('div', 'div_action');

           const p_price = createElement('p', 'furniture_price', { 
                textContent: `${furniture.price.toLocaleString('ru-RU')}` + ' ₽' 
            });

            const span_heart = createElement('span', HEART_STORAGE_KEY, { 
                innerHTML: svgIcons.heart 
            });
            span_heart.dataset.id = furniture.id;

            const heartIdsSet = cartIdsSet(favorite);
            if(isCartItem(furniture.id, heartIdsSet)){
                span_heart.classList.add('heart_added');
            }
            span_heart.addEventListener('click', () => handleHeartClick(furniture, span_heart));


            const span_close = createElement('span', 'deleteFurniture', { innerHTML: svgIcons.deleteCard });
            span_close.addEventListener('click', () => handleRemoveClick(furniture, card));

            const div_stepper = createElement('div', 'stepper');
            const decrementBtn = createElement('button', 'stepper-btn decrement', { textContent: '-' });
            const incrementBtn = createElement('button', 'stepper-btn increment', { textContent: '+' });

            const quantityInput = createElement('input', 'stepper-input');
            quantityInput.type = 'text';
            quantityInput.value = cart[index]?.quantity ?? 1;
            quantityInput.readOnly = true;

            decrementBtn.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    const newValue = currentValue - 1;
                    updateQuantity(newValue,quantityInput,cart,index);
                }
            });

            incrementBtn.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                const newValue = currentValue + 1;

                if (newValue > furniture.volume) {
                    alert(`Извините, доступно только ${furniture.volume} шт. этого товара`);
                    return;
                }

                updateQuantity(newValue, quantityInput,cart,index);
            });

            div_stepper.append(decrementBtn,quantityInput,incrementBtn);

             // Проверяем наличие товара на складе
            if (furniture.volume <= 0) {
                handleOutOfStock(div_info, [p_name, p_price, div_color, furniture_img]);
                div_stepper.style.display = 'none'; 
            } else {
                div_info.appendChild(div_stepper); 
            }

            div_info.append(p_name,p_size,div_color,p_price,div_action);
            div_action.append(span_heart,span_close);
            card.append(furniture_img,div_info);
            p_size.append(icon_size,size_text);
            resultContainer.appendChild(card);

        });

        updateBasketSummary(cart);
    }
    else{
        resultContainer.innerHTML = '<p>Список пуст</p>';
        console.log('Товары не найдены');
    }
}


function updateQuantity(newQuantity,quantityInput,cart,index){
    quantityInput.value = newQuantity;
    cart[index].quantity = newQuantity;

    saveCart(cart,CART_STORAGE_KEY);
    displayCountsHeader(CART_STORAGE_KEY);
    updateBasketSummary(cart);
}

// Обработчик клика на крестик (удаление товара из корзины)
async function handleRemoveClick(furniture, cardElement) {
    console.log(furniture,cardElement);
    
    // Получаем текущий список товаров в корзине
    let cart = await getCart(CART_STORAGE_KEY);

    const itemId = furniture.id; // Уникальный идентификатор товара

    // Проверяем, есть ли товар в корзине
    const isInCart = isCartItem(itemId, cart);

    //проверка авторизации пользователя
    // isAuthenticated();
    console.log(getUserIsAuth(),isInCart);

    if (isInCart) {

        cart = cart.filter(item => item.id !== itemId);
        saveCart(cart, CART_STORAGE_KEY); 
        cardElement.remove();

        // Обновляем отображение общей суммы и количества товаров
        updateBasketSummary(cart);

        // Обновление счетчика
        displayCountsHeader(CART_STORAGE_KEY);

        // Асинхронная синхронизация с сервером
        console.log(getUserIsAuth());
        if (getUserIsAuth()) {
            responseProcessingSync(cart,itemId,CART_STORAGE_KEY);
        }
    }
}


// Функция для пересчета суммы и количества товаров
const updateBasketSummary = (cart) => {
    try{
        const fieldCount = document.querySelector('.count_furniture');
        const fieldTotalSum = document.querySelector('.totalPrice');
        const resCalc = calcTotalSumCart(cart);

        fieldTotalSum.textContent = `${Number(resCalc.totalSum).toLocaleString('ru-RU')} ₽`;
        fieldCount.textContent = `${resCalc.totalCount} ${getGoodsWord(resCalc.totalCount)}`;
    }
    catch (e) {
        alert('Не удалось рассчитать сумму. Повторите попытку позже');
        console.log(e);
    }
    
};



