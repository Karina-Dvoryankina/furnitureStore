import { getAcessToken,removeCookie,setLocalStorage, getLocalStorage, removeAcessToken, fetchWithAuth, setSessionStorage, getSessionStorage } from "./auth.js";
import { openFurnitureModal } from './modal.js';

const COLOR_STORAGE_KEY = 'selectedColors';
export const HEART_STORAGE_KEY = 'heart';
export const CART_STORAGE_KEY = 'basket';
const FURNITURE_CACHE_KEY = 'furnitureCache';
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; 

let authStateListeners = [];

export function isCacheExpired() {
    const cacheTime = getLocalStorage('cacheTimestamp');
    if (!cacheTime) return true;
    return Date.now() - parseInt(cacheTime) > CACHE_EXPIRATION_TIME;
}

export function updateCacheTimestamp() {
    setLocalStorage('cacheTimestamp', Date.now().toString());
}

export function clearFurnitureCache() {
    sessionStorage.removeItem(FURNITURE_CACHE_KEY);
    sessionStorage.removeItem('cacheTimestamp');
}

//кэшируем полученный список мебели
export function cacheFurniture(furniture) {
    const cache = getAllCachedFurniture();
    cache[furniture.id] = {
        id: furniture.id,
        name: furniture.name,
        price: furniture.price,
        images: furniture.images,
        width: furniture.width,
        height: furniture.height,
        depth: furniture.depth,
        colors: furniture.colors,
        volume: furniture.volume,
        description: furniture.description
    };
    setLocalStorage(FURNITURE_CACHE_KEY, JSON.stringify(cache));
    updateCacheTimestamp();
}

//получаем кэшированную мебель
export function getCachedFurniture(id) {
    if (isCacheExpired()) {
        return null;
    }
    const cache = getAllCachedFurniture();
    return cache[id];
}

export function getAllCachedFurniture() {
    return JSON.parse(getLocalStorage(FURNITURE_CACHE_KEY)) || {};
}

//добавить прослушиватель аутентификации
export function addAuthStateListener(callback) {
    authStateListeners.push(callback);
}

//уведомить об изменении состояния авторизации
export function notifyAuthStateChanged() {
    authStateListeners.forEach(callback => callback(getUserIsAuth()));
}

//прослушивание всех полей формы
export function AddEventListenerAllInput(formInputs,validateForm){
    formInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });
}

//проверка всех полей формы на пустоту
export function IsEmptyAllFilled(formInputs){
    return Array.from(formInputs).every(input => input.value.trim() !== '');
}

//dropdown для входа или регистрации
export function DisplayDropdownAuth(){
    const ul = document.querySelector('.dropdown_authorization');
    if (ul) ul.classList.toggle('dropdown_authorization_active');
}

//добавление обработчика события кнопки входа 
export function LoginAddEventListner (voitiClick){
    if (voitiClick) {
        voitiClick.addEventListener('click', function (){
            getUserIsAuth() ? Logout() : DisplayDropdownAuth();
            ToogleButtonAuth();
        });
    }  
}

//обновлять элементы, зависящие от аутентификации
export function updateAuthDependentElements(isAuth) {

    displayCountsHeader(HEART_STORAGE_KEY);
    displayCountsHeader(CART_STORAGE_KEY); 
    
    updateButtonsState(HEART_STORAGE_KEY);   
    updateButtonsState(CART_STORAGE_KEY);
}

const BTN_CFG = {
  heart: {  // == HEART_STORAGE_KEY
    selector: '.heart:not(.count)',
    addedClass: 'heart_added',
    toggleText: null
  },
  basket: { // == CART_STORAGE_KEY
    selector: '.furnitureAddBasket',
    addedClass: 'basket_added',
    toggleText(btn) {
       ToggleBtnBuyToCart(btn);
    }
  }
};


async function updateButtonsState(storageKey, itemId = null) {
  const cfg  = BTN_CFG[storageKey];         
  const list = await getCart(storageKey);   
  const idSet = cartIdsSet(list); 

  // область поиска: либо документ целиком, либо одна карточка
  const scope = itemId == null
        ? document
        : document.querySelector(`.tovar_card[data-id="${itemId}"]`);
  if (!scope) return;

  scope.querySelectorAll(cfg.selector).forEach(btn => {
     const id = Number(btn.dataset.id);
     const active = idSet.has(id);

     btn.classList.toggle(cfg.addedClass, active);
     if (cfg.toggleText) cfg.toggleText(btn);
  });
}


//фильтрация списка по источнику добавления
function listFilterSource(list){
    return list.filter(item => item.source === 'local');
}

//оставляем только элементы с локальным источником 
async function updateSourceLocal(){
    const basket = await getCart(CART_STORAGE_KEY);
    const heart = await getCart(HEART_STORAGE_KEY);

    const localBasket = listFilterSource(basket);
    const localHeart = listFilterSource(heart);

    saveCart(localBasket, CART_STORAGE_KEY);
    saveCart(localHeart, HEART_STORAGE_KEY);

    displayCountsHeader(CART_STORAGE_KEY);
    displayCountsHeader(HEART_STORAGE_KEY);
}

//выход 
export function Logout(){
    removeAcessToken();
    removeCookie('refreshToken');
    clearFurnitureCache();
    setUserIsAuth(false);
    updateSourceLocal();
    notifyAuthStateChanged();
}

//очистка локального хранилиза по имени
export function removeLocalStorage(name){
    localStorage.removeItem(name);
}

//смена состояния кнопки авторизации 
export function ToogleButtonAuth(){
    const authButton = document.querySelector('.voiti_click');
    const dropdown_auth = document.querySelector('.dropdown_authorization');

    if (!authButton || !dropdown_auth) return;

    const isAuth = getUserIsAuth();
    console.log(isAuth);
        
    authButton.lastChild.nodeValue = isAuth ? 'Выйти' : 'Войти';
    dropdown_auth.style.display = isAuth ? 'none' : 'block';
}

 // Функция для добавления или удаления класса 'invalid'
export function toggleValidationClass(input, isValid) {
    if (input && input.classList) {
        input.classList.toggle('invalid',!isValid);
    } else {
        console.error('Ошибка: input не является элементом DOM.');
        console.log(input);
    }
}

export function IsValidAllInputs(selectorInputs,selectorButton){
    const formInputs = document.querySelectorAll(`${selectorInputs}`);
    const submitButton = document.querySelector(`${selectorButton}`);

    AddEventListenerAllInput(formInputs,validateForm);

    function validateForm() {
        const allFilled = IsEmptyAllFilled(formInputs);
        submitButton.classList.toggle('disabled',!allFilled);

        console.log({
            allFilled
        });
    }  
}

export function cartIdsSet(cart) {
  return new Set(cart.map(o => o.id)); 
}

// Проверка, есть ли товар в списке
export function isCartItem(id, idsSet) {
  return idsSet.has(id);              
}


// Функция для получения списка товаров только из localStorage
export function getCartLocal(name) {
    const cart = localStorage.getItem(name);
    return cart ? JSON.parse(cart) : [];
}


// Функция для получения списка товаров из localStorage или бд по имени
export async function getCart(name) {
    try {
        const cartLocal = getCartLocal(name);
        
        if (getUserIsAuth() && cartLocal.length === 0) {
            const serverCart = await requestGetCartServer(name);
            if (serverCart.length > 0) {
                saveCart(serverCart, name);
            }
            return serverCart;
        }

        return cartLocal;
    } catch (error) {
        console.error(`Ошибка в getCart(${name}):`, error);
        return [];
    }
}

async function requestGetCartServer(name){
    const apiUrl = name === HEART_STORAGE_KEY 
    ? '/api/favorites/getList' 
    : '/api/cart/getList';

    try {
        const response = await fetchWithAuth(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка при получении списка ${name}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            console.warn(`Ожидали массив с сервера, получили:`, data);
            return [];
        }
        
        return data;

    } catch (error) {
        console.error(`Ошибка при загрузке ${name}:`, error.message);
        return [];
    }
}

//  функция слияния списков
function mergeList(serverList, name, localList) {

    console.log(serverList,name,localList);

    const serverIds = new Set(serverList.map(item => item.id));

    const filteredLocalItems = localList.filter(
        item => item.syncStatus === 'synced' && !serverIds.has(item.id)
    );

    const merged = [...serverList, ...filteredLocalItems];

    saveCart(merged, name);
    displayCountsHeader(name);
    return merged;
}

//обработчик выбора цвета в карточке товара
export async function handleColorClick(e) {  
    const circle     = e.currentTarget;
    const colorIndex = circle.dataset.index;
    const itemId     = circle.dataset.id;          
    const container  = circle.closest('.tovar_card') ||
                       circle.closest('.modal_inner');

    // 1. снимаем/ставим active там, где кликнули
    container.querySelector('.cricle_color.active_color')
             ?.classList.remove('active_color');
    circle.classList.add('active_color');

    // 2. если клик был в модалке –‑ синхронизируем карточку
    if (!container.classList.contains('tovar_card')) {
        const card = document.querySelector(`.tovar_card[data-id="${itemId}"]`);
        if (card) {
            card.querySelector('.cricle_color.active_color')
                ?.classList.remove('active_color');

            card.querySelector(`.cricle_color[data-index="${colorIndex}"]`)
                ?.classList.add('active_color');

            card.dataset.selectedColor = colorIndex;
        }
    } else {
        // если же кликнули прямо в карточке
        container.dataset.selectedColor = colorIndex;
    }

    // 3. записываем выбор в localStorage
    saveSelectedColor(itemId, colorIndex);
}


// Функция для сохранения списка товаров в localStorage
export function saveCart(cart,name) {
    localStorage.setItem(`${name}`, JSON.stringify(cart));
}

export function saveSelectedColor(itemId, colorIndex) {
    const colors = loadJson(COLOR_STORAGE_KEY, {});
    colors[itemId] = colorIndex;
    localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(colors));
}

export function getSelectedColor(itemId) {
    const colors = loadJson(COLOR_STORAGE_KEY, {});
    const colorIndex = colors[itemId];
    const numericIndex = Number(colorIndex);
    return !isNaN(numericIndex) ? numericIndex : 0;
}


export function UpdateCart(list, isInList, itemId, classIcon, nameList) {
    const isAuth = getUserIsAuth();
    if (isInList) {
      // Удаление товара из списка
      list = list.filter(item => item.id !== itemId);
      classIcon.classList.remove(`${nameList}_added`);
    } else {
        console.log(getSelectedColor(itemId));
      // Добавление товара в список
        const newItem = {
            id: itemId,
            syncStatus: isAuth ? 'synced' : 'pending',
            source: isAuth ? 'server' : 'local',
            quantity: 1
        }
      list.push(newItem);
      classIcon.classList.add(`${nameList}_added`);
    }
  
    saveCart(list, nameList);
    displayCountsHeader(nameList);
  
    //синхронизация с сервером
    if (isAuth) {
      responseProcessingSync(list, itemId, nameList);
    }
}

  // Обновленная функция responseProcessingSync (для обратной совместимости)
export function responseProcessingSync(list, itemId, nameList) {
    responseProcessingBatchSync(list, [itemId], nameList);
}


export function responseProcessingBatchSync(list, itemIds, nameList) {
    syncCartWithServer(itemIds, nameList)
        .then(() => {
            const updatedList = list.map(item => 
                itemIds.includes(item.id) 
                    ? { ...item, syncStatus: 'synced' } 
                    : item
            );
            
            saveCart(updatedList, nameList);
            displayCountsHeader(nameList);
            console.log(`Синхронизация ${itemIds.length} элементов ${nameList} завершена`);
        })
        .catch((error) => {
            console.error(`Ошибка синхронизации ${nameList}:`, error.message);
            const updatedList = list.map(item => 
                itemIds.includes(item.id)
                    ? { ...item, syncStatus: 'error' }
                    : item
            );
            saveCart(updatedList, nameList);
            retryBatchSyncWithExponentialBackoff(itemIds, list, nameList);
        });
}


// функция для синхронизации локальной корзины при авторизации
export async function syncLocalCartsWithServer(name) {
    try {
        console.log(`синхронизируем ${name}`);
        // Синхронизируем корзину
        const cart = await getCart(name);
 
        const localBasket = cart.filter(item => 
            item.source === 'local' && item.syncStatus !== 'synced'
        );
      
        if (localBasket.length > 0) {
            
            const basketIds = localBasket.map(item => item.id);
            await syncCartWithServer(basketIds, name);
        
            // Обновляем статусы
            const updatedBasket = await getCart(name).map(item => 
            basketIds.includes(item.id) 
                ? { ...item, syncStatus: 'synced' } 
                : item
            );

            // Объединяем серверные данные с локальными
            const serverData = await requestGetCartServer(name);
            const merged = mergeList(serverData, name, updatedBasket);  

            saveCart(merged, name);
            displayCountsHeader(name);
        }
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
    }
}

// Функция для повторной синхронизации с экспоненциальным бэкоффом
function retryBatchSyncWithExponentialBackoff(itemIds, list, nameList, attempt = 1, maxAttempts = 5, baseInterval = 10000) {
    const retryInterval = Math.min(baseInterval * Math.pow(2, attempt - 1), 60000);
    
    setTimeout(() => {
        syncCartWithServer(itemIds, nameList)
            .then(() => {
                const updatedList = list.map(item => 
                    itemIds.includes(item.id)
                        ? { ...item, syncStatus: 'synced' }
                        : item
                );
                saveCart(updatedList, nameList);
                displayCountsHeader(nameList);
                console.log(`Элементы ${itemIds} успешно синхронизированы.`);
            })
            .catch(error => {
                if (attempt < maxAttempts) {
                    console.error(`Попытка ${attempt} синхронизации не удалась. Ошибка: ${error.message}`);
                    retryBatchSyncWithExponentialBackoff(itemIds, list, nameList, attempt + 1, maxAttempts, baseInterval);
                } else {
                    console.error(`Элементы ${itemIds} не удалось синхронизировать после ${maxAttempts} попыток.`);
                    const updatedList = list.map(item => 
                        itemIds.includes(item.id)
                            ? { ...item, syncStatus: 'error-permanent' }
                            : item
                    );
                    saveCart(updatedList, nameList);
                }
            });
    }, retryInterval);
}


// Синхронизация с сервером
export async function syncCartWithServer(ids, nameList) {
    const apiUrl = nameList === HEART_STORAGE_KEY 
        ? '/api/favorites/add' 
        : '/api/cart/add';

    try {
        const response = await fetchWithAuth(apiUrl, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ids)
        });

        if (!response.ok) {
            throw new Error(`Ошибка синхронизации ${nameList}`);
        }

        const result = await response.text();
        console.log(`${nameList} успешно синхронизирован с сервером:, ${result}`);
        return result;
    } catch (error) {
        console.error(`Ошибка синхронизации ${nameList}:, error.message`);
        throw error;
    }
}

function loadJson(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    // Если в хранилище ничего нет – берём дефолт
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    // Данные битые → очищаем и возвращаем дефолт
    localStorage.removeItem(key);
    return fallback;
  }
}



// Обработка клика по "избранному"
export async function handleHeartClick(furniture, span_heart) {
    let favorites = await getCart(HEART_STORAGE_KEY);
    const itemId = furniture.id;
    const idsSet = cartIdsSet(favorites);
    const isFavorite = isCartItem(itemId, idsSet);

    UpdateCart(favorites, isFavorite, itemId, span_heart, HEART_STORAGE_KEY);

    // updateFavoriteButtons(span_heart);
    updateButtonsState(HEART_STORAGE_KEY, itemId);
}

// Обработка клика по "добавлению в корзину"
export async function handleBuyClick(furniture, btn) {
    let cart = await getCart(CART_STORAGE_KEY);
    const itemId = furniture.id;
    const idsSet = cartIdsSet(cart);
    const isInCart = isCartItem(itemId, idsSet);
    const cachedItem = getCachedFurniture(itemId);

    if (!isInCart && !furnitureIsStock(cachedItem.volume)) {
        alert('Товар раскупили');
        return;
    }

    UpdateCart(cart, isInCart, itemId, btn, CART_STORAGE_KEY);
    ToggleBtnBuyToCart(btn);
    // updateAddToCartButtons(btn);
    updateButtonsState(CART_STORAGE_KEY, itemId);
}

export function furnitureIsStock(volume){
    return volume > 0;
}

// Проверяем наличие товара
// async function checkFurniturwInStock(idFurniture){
//     const url = `/api/checkStock/${idFurniture}`;
//     try {
//         const response = await fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });
//         if (response.ok) {
//             const result = await response.json();
//             console.log(`Товар ${idFurniture} в наличии`,`${result.volume} шт`);
//             return result.stock;
//         } else {
//             const errorMessage = await response.text();
//             console.error('Ошибка:', errorMessage);
//             alert('Ошибка проверки наличия товара: ' + errorMessage);
//             return false;
//         }
//     } catch (error) {
//         console.error('Ошибка соединения:', error);
//         alert('Не удалось подключиться к серверу. Попробуйте позже.');
//         return false;
//     }
// }

export function ToggleBtnBuyToCart(btn){
    const btn_text = btn.lastElementChild;
    console.log(btn_text);
    btn_text.textContent = btn.classList.contains('basket_added') ? 'В корзине' : 'Купить';
}

// Обработчик для фиксации бордера шапки при скроле
export function scrollFixedHeader (){
    const nav = document.querySelector('nav');
    nav.classList.toggle('fixed_border', window.scrollY >= 12);
}

// обновление счетчика количества товаров в шапке
export async function updateHeaderCounter(header_count, length){
    header_count.textContent = length;
    header_count.classList.toggle('count_active', length > 0)
}


// Функция для вывода счетчика количества товаров в шапке
export async function displayCountsHeader(class_name) {
    try {
        const header_count = document.querySelector(`.count.${class_name}`);
        if (!header_count) return;

        const local = await getCart(class_name);
        const localList = Array.isArray(local) ? local : [];

        if (class_name === CART_STORAGE_KEY) {
            let totalQuantity = 0;
            localList.forEach(item => totalQuantity += item.quantity);
            updateHeaderCounter(header_count, totalQuantity);
            return;
        }

        updateHeaderCounter(header_count, localList.length);
        
    } catch (error) {
        console.error(`Ошибка при отображении счётчика товара (${class_name}):`, error);        
    }
    
}

//функция для создания отдельных компонентов карточки
export function createElement(tag, className, attributes = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    Object.entries(attributes).forEach(([key, value]) => {
        element[key] = value;
    });
    return element;
}

export const svgIcons = {
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M24 46C36.1503 46 46 36.1503 46 24C46 11.8497 36.1503 2 24 2C11.8497 2 2 11.8497 2 24C2 36.1503 11.8497 46 24 46ZM24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z" fill="white" fill-opacity="0.16" /> <path class="path_heart" d="M25.3911 32.0364L25.3915 32.036L32.4212 24.9859L32.4215 24.9857C32.4404 24.9683 32.4651 24.9452 32.4948 24.9166L32.193 24.6036L32.4948 24.9166C32.554 24.8595 32.6336 24.78 32.7266 24.6801C32.9115 24.4814 33.156 24.1953 33.4014 23.837C33.8791 23.1398 34.4348 22.0607 34.4348 20.7609C34.4348 17.3726 31.6618 14.5652 28.2391 14.5652C26.3351 14.5652 24.9078 15.3489 24 16.0432C23.0922 15.3489 21.6649 14.5652 19.7609 14.5652C16.3382 14.5652 13.5652 17.3726 13.5652 20.7609C13.5652 22.0795 14.1578 23.151 14.6024 23.8121C14.8403 24.1658 15.0792 24.4535 15.2592 24.6538C15.3498 24.7546 15.4272 24.8353 15.4845 24.893C15.5132 24.922 15.537 24.9453 15.555 24.9627L15.5565 24.9641L15.5678 24.975L22.6076 32.0351L22.6081 32.0355L23.6926 33.12L24 33.4275L24.3074 33.12L25.3911 32.0364Z" fill="white" stroke="white" stroke-width="0.869565" /> </svg>`,
    size: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <g opacity="0.4"> <path d="M12 3.75C9.43359 3.75 7.09863 4.16016 5.32031 4.99219C3.54199 5.82422 2.25 7.20117 2.25 9V15.75C2.25 16.5117 2.63379 17.1973 3.1875 17.7422C3.74121 18.2871 4.46777 18.7354 5.34375 19.1016C7.09863 19.8311 9.43066 20.25 12 20.25C14.5693 20.25 16.9014 19.8311 18.6562 19.1016C19.5322 18.7354 20.2588 18.2871 20.8125 17.7422C21.3662 17.1973 21.75 16.5117 21.75 15.75V8.25H20.25V9C20.25 9.66797 19.9102 10.1191 19.1953 10.5703C18.4805 11.0215 17.4346 11.3584 16.3594 11.5781C14.209 12.0146 12 12 12 12C9.60059 12 7.43262 11.5957 5.92969 10.9688C5.17676 10.6553 4.59961 10.2656 4.24219 9.91406C3.88477 9.5625 3.75 9.27539 3.75 9C3.75 7.89258 4.47363 7.01953 5.95312 6.32812C7.43262 5.63672 9.59473 5.25 12 5.25C14.4053 5.25 15.7764 5.63672 16.4766 6.04688C17.1768 6.45703 17.25 6.81152 17.25 7.05469C17.25 7.40039 17.1738 7.63184 16.9922 7.85156C16.8105 8.07129 16.5029 8.28223 16.0547 8.46094C15.1582 8.81836 13.7168 9 12 9C12 9 10.9248 8.99707 9.89062 8.78906C9.375 8.68359 8.87695 8.51953 8.57812 8.34375C8.34961 8.20898 8.34375 8.14453 8.32031 8.0625C8.46387 7.97754 8.74805 7.87207 9.11719 7.78125C9.87598 7.59668 10.96 7.48535 12 7.5V6C10.8516 5.98242 9.68555 6.07617 8.74219 6.30469C8.27051 6.41895 7.86328 6.57422 7.5 6.79688C7.13672 7.01953 6.75 7.40918 6.75 7.96875C6.75 8.72754 7.2832 9.31055 7.82812 9.63281C8.37305 9.95508 9 10.1191 9.60938 10.2422C10.8252 10.4883 12 10.5 12 10.5C13.8135 10.5 15.375 10.3301 16.5938 9.84375C17.2031 9.60059 17.748 9.28418 18.1406 8.8125C18.5332 8.34082 18.75 7.70801 18.75 7.05469C18.75 6.2959 18.3076 5.37891 17.25 4.75781C16.1924 4.13672 14.5635 3.75 12 3.75ZM3.75 11.4609C4.20703 11.8008 4.73438 12.0967 5.34375 12.3516C7.09863 13.0811 9.43066 13.5 12 13.5C12 13.5 14.291 13.5322 16.6406 13.0547C17.8154 12.8174 19.0195 12.4482 19.9922 11.8359C20.0801 11.7803 20.165 11.71 20.25 11.6484V15.75C20.25 16.0254 20.1152 16.3125 19.7578 16.6641C19.5176 16.9014 19.1777 17.1533 18.75 17.3906V14.25H17.25V18C16.7842 18.1406 16.2891 18.2666 15.75 18.375V16.5H14.25V18.6094C13.7637 18.6621 13.2686 18.709 12.75 18.7266V15H11.25V18.7266C10.7344 18.709 10.2363 18.6621 9.75 18.6094V16.5H8.25V18.3984C7.70215 18.293 7.21582 18.1494 6.75 18V14.25H5.25V17.3906C4.82227 17.1533 4.48242 16.9014 4.24219 16.6641C3.88477 16.3125 3.75 16.0254 3.75 15.75V11.4609Z" fill="white"/> </g> </svg>`,
    basket: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"viewBox="0 0 24 24" fill="none"> <path d="M10.7358 14.564V17.641C10.7358 18.0656 10.3912 18.4102 9.96652 18.4102C9.54188 18.4102 9.19725 18.0656 9.19725 17.641V14.564C9.19725 14.1394 9.54188 13.7948 9.96652 13.7948C10.3912 13.7948 10.7358 14.1394 10.7358 14.564ZM14.0693 13.7948C13.6447 13.7948 13.3 14.1394 13.3 14.564V17.641C13.3 18.0656 13.6447 18.4102 14.0693 18.4102C14.4939 18.4102 14.8386 18.0656 14.8386 17.641V14.564C14.8386 14.1394 14.4939 13.7948 14.0693 13.7948ZM20.4379 11.4337L19.7281 18.5364C19.4953 20.8667 18.2439 22 15.9012 22H8.13675C5.79407 22 4.54174 20.8677 4.30994 18.5364L3.60214 11.4552C2.65748 10.9988 2 10.0398 2 8.92288C2 7.36696 3.26468 6.10233 4.82065 6.10233H7.03305L9.29065 2.37099C9.51015 2.00791 9.98098 1.89098 10.3471 2.11149C10.7102 2.33098 10.8271 2.80485 10.6066 3.16793L8.83115 6.10336H15.1402L13.3914 3.16382C13.174 2.79869 13.294 2.32688 13.6591 2.10944C14.0243 1.89098 14.496 2.01303 14.7135 2.37714L16.931 6.10438H19.1793C20.7353 6.10438 22 7.36901 22 8.92493C22 10.0234 21.36 10.9691 20.4379 11.4337ZM3.53754 8.92288C3.53754 9.62956 4.11295 10.205 4.81965 10.205H19.1793C19.886 10.205 20.4615 9.62956 20.4615 8.92288C20.4615 8.21621 19.886 7.64081 19.1793 7.64081H4.81965C4.11295 7.64081 3.53754 8.21621 3.53754 8.92288ZM18.8613 11.7434H5.17561L5.83921 18.3835C5.9746 19.7312 6.37976 20.4615 8.13575 20.4615H15.9002C17.6469 20.4615 18.0644 19.6995 18.1967 18.3835L18.8613 11.7434Z" fill="#fff" /></svg>`,
    deleteCard: `<a href="#"><svg class="close_form" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.3306 13.3295C13.77 12.8901 14.4823 12.8902 14.9216 13.3295L20.1478 18.5562L25.3745 13.3295C25.8139 12.8902 26.5262 12.8902 26.9655 13.3295C27.4049 13.7688 27.4049 14.4812 26.9655 14.9205L21.7388 20.1473L26.9656 25.3746C27.4049 25.8139 27.4049 26.5263 26.9655 26.9656C26.5261 27.4049 25.8138 27.4049 25.3745 26.9655L20.1478 21.7383L14.9205 26.9655C14.4812 27.4049 13.7688 27.4049 13.3295 26.9655C12.8902 26.5262 12.8902 25.8139 13.3295 25.3745L18.5568 20.1472L13.3306 14.9205C12.8912 14.4811 12.8913 13.7688 13.3306 13.3295Z" fill="white"/><circle cx="20" cy="20" r="19.5" stroke="white" stroke-opacity="0.2"/></svg></a>`
};

// создание кнопки покупки
export function createBuyButton(furniture, isCart, handlers) {
    const btn_pay = createElement('button', 'furnitureAddBasket',{
        innerHTML:`
            <span class="iconBasket">${svgIcons.basket}</span>
            <p class="btn_text">${isCart ? 'В корзине' : 'Купить'}</p>`});
    btn_pay.dataset.id = furniture.id;

    btn_pay.classList.toggle('basket_added', isCart);
    
    btn_pay.addEventListener('click', () => handlers.onBuyClick(furniture, btn_pay));
    
    return btn_pay;
}

export function createFurnitureCard(furniture, heartList, basketList, handlers) {

    const card = createElement('a', 'tovar_card');
    card.dataset.id = furniture.id; 

    card.addEventListener('click', (e)=>{
        if (e.target.closest('.furnitureAddBasket') ||
            e.target.closest(`.${HEART_STORAGE_KEY}`) ||
            e.target.closest('.furniture_color')) return;
        openFurnitureModal(furniture.id);
    });

    const furniture_img = createElement('img', '', { 
        src: furniture.images[0],
        alt: furniture.name
    });

    const div_name = createElement('div', 'div_name');
    const p_name = createElement('p', 'furniture_name', { 
        textContent: furniture.name 
    });

    const span_heart = createElement('span', HEART_STORAGE_KEY, { 
        innerHTML: svgIcons.heart 
    });
    span_heart.dataset.id = furniture.id;

    const heartIdsSet = cartIdsSet(heartList);
    if(isCartItem(furniture.id, heartIdsSet)){
        span_heart.classList.add('heart_added');
    }
    span_heart.addEventListener('click', () => handlers.onHeartClick(furniture, span_heart));
    
    const div_info = createElement('div', 'div_info');

    const p_size = createElement('p', 'furniture_size');
    const size_text = createElement('span', '', { 
        textContent: `${furniture.width} x ${furniture.height} x ${furniture.depth}` 
    });
    const icon_size = createElement('span', 'icon_size', { 
        innerHTML: svgIcons.size 
    });

    const div_color = createColorOptions(furniture);
    
    const p_price = createElement('p', 'furniture_price', { 
        textContent: `${furniture.price.toLocaleString('ru-RU')}` + ' ₽' 
    });

    div_info.append(furniture_img,div_name,p_size,div_color,p_price);

    // Проверяем наличие товара на складе
    if (furniture.volume <= 0) {
        handleOutOfStock(div_info, [p_name, p_price, div_color, furniture_img]);
    } else {
        const idsSet = cartIdsSet(basketList);
        const isCart = isCartItem(furniture.id, idsSet);
        const btn_pay = createBuyButton(furniture, isCart, handlers);
        div_info.appendChild(btn_pay); 
    }

    card.append(div_info);
    div_name.append(p_name,span_heart);
    p_size.append(icon_size,size_text);

    return card;
}

export function createColorOptions(furniture){
    const color = createElement('div', 'furniture_color',{
      innerHTML:
        '<p class="p_color">Варианты цветов:</p>'
    });
      
    const savedColor = getSelectedColor(furniture.id);
    const initialColor = savedColor !== null ? savedColor : 0;
    console.log(savedColor,initialColor);
    
    furniture.colors.forEach((item, index) => {
        const cricle = createElement('div', 'cricle_color');
        cricle.style.backgroundColor = item.colorHex;
        cricle.dataset.index = index;
        cricle.dataset.id = furniture.id;

        if (index === initialColor) {
            cricle.classList.add('active_color');
        }
        
        cricle.addEventListener('click', handleColorClick);
        color.append(cricle);
    });

    return color;
}

export function handleOutOfStock(card, elementsToDisable) {
    const divStockMessage = createElement('div', 'divStockMessage');
    const outOfStockMessage = createElement('p', 'out_of_stock', { 
        textContent: 'Товар закончился'
    }); 
    
    elementsToDisable.forEach(el => el.classList.add('unavailable'));
    divStockMessage.append(outOfStockMessage);
    card.append(divStockMessage);
}

//функция для отображения карточек товаров
export async function DisplayFurnitureCard(listFurniture,resultContainer){

    if (listFurniture.length === 0) {
        resultContainer.innerHTML = '<p>Список пуст</p>';
        return;
    }

    const heartList = await getCart(HEART_STORAGE_KEY);
    const basketList = await getCart(CART_STORAGE_KEY);

    saveCart(heartList,HEART_STORAGE_KEY);
    saveCart(basketList,CART_STORAGE_KEY);

    displayCountsHeader(HEART_STORAGE_KEY);
    displayCountsHeader(CART_STORAGE_KEY);

    listFurniture.forEach(furniture => {
        const card = createFurnitureCard(furniture, heartList, basketList, {
            onHeartClick: handleHeartClick,
            onBuyClick: handleBuyClick,
        });
        resultContainer.appendChild(card);
    });
}

//получение товаров активной категории
export function loadFurnitureByCategories(data) {
    const url = '/api/furniture/byCategories';

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(async response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const furnitureList = await response.json();
        // Обновляем кэш для всех полученных товаров
        furnitureList.content.forEach(furniture => cacheFurniture(furniture));
        return furnitureList;
    })
    .catch(error => console.error('Error:', error));
}

//получение информации о товаре по id
export function getFurnitureById(furnitureId){
    console.log(furnitureId);
    return fetch(`/api/${furnitureId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Товар не найден');
    })
    .then(furniture => {
        // Обновляем кэш для этого товара
        cacheFurniture(furniture);
        return furniture;
    })
    .catch(error => {
        console.error('Ошибка:', error);
        throw error; 
    });
}

export function getGoodsWord(count) {
    const cases = [2, 0, 1, 1, 1, 2];
    const words = ['товар', 'товара', 'товаров'];
    return words[
        count % 100 > 4 && count % 100 < 20 
            ? 2 
            : cases[Math.min(count % 10, 5)]
    ];
}


export function calcTotalSumCart(cart){
    let totalSum = 0;
    let totalCount = 0;
    cart.forEach((item,index) => {
        totalSum += (cart[index]?.price ?? getCachedFurniture(item.id).price) * item.quantity;
        totalCount += item.quantity;
    });

    return {totalSum,totalCount};
}

export async function request(url, { method = 'GET', data = null, headers = {} } = {}) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
            console.log('Отправляемые данные:', data)
        }

        const response = await fetchWithAuth(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get("Content-Type") || "";
        return contentType.includes("application/json") ? response.json() : response.text();

    } catch (error) {
        console.error(`Ошибка запроса к ${url}: ${error.message}`);
        if (error.message.includes('401')) {
            throw new Error('Требуется авторизация');
        }
        throw error; 
    }
}



// Функция для получения уникальных цветов по нескольким категориям
export function GetUniqueColors(categories) {
    const queryString = new URLSearchParams({
        categories: categories
    }).toString();
    const apiUrl = `/api/furniture/colors?${queryString}`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Unique Colors:', data);
            return data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// GetUniqueColors(['стол','стул']);



//Регистрация пользователя
export function Registration(data) {
    const url = '/api/registration';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    return fetch(url, options) 
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
                });
            }
            return response.json(); 
        });
}

// let information = {
//     "firstName": "John",
//     "lastName": "Doe",
//     "password": "password123",
//     "phoneNumber": "123456789",
//     "confirmPassword": "password123",
//     "email": "m.gof2012@yandex.ru",
//     "role": "user"
//   }


export function submitForm(pass,mail) {

    const data = {
        password: pass,
  		email: mail
    };

    fetch('http://127.0.0.1:5500/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Успех:', data);
        alert('Регистрация успешна!');
    })
    .catch((error) => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при регистрации.');
    });
}


//обновление информации об авторизации пользователя
export function setUserIsAuth(value) {
    sessionStorage.setItem('UserIsAuth', value);
}

//авторизован ли пользователь?
export function getUserIsAuth() {
    return sessionStorage.getItem('UserIsAuth') === 'true';
}


//функция для удаления товара администратором
//нет проверки что операцию выполняет администратор? 
export function deleteFurnitureByArticle (article) {
    const url = `/api/furniture/delete/${encodeURIComponent(article)}`;

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return {}; 
        } else if (response.status === 404) {
            throw new Error('Furniture not found');
        } else {
            throw new Error('Failed to delete furniture');
        }
    });
};



//Функция для добавления нового товара
//нет проверки что операцию выполняет администратор? 
export function addFurniture(furnitureData) {
    const url = '/api/admin/furniture/add';
    console.log(getAcessToken());
    console.log(JSON.stringify(furnitureData)); 

    return fetch(url, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAcessToken()}`
        },
        body: JSON.stringify(furnitureData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Товар успешно добавлен на сайт');
        return data;
    })
    .catch(error => {
        console.error('Ошибка:', error.message);
        alert('Не удалось добавить новый товар! Попробуйте повторить попытку позже');
    });
}

// Это пример структуры данных, которые нужно передать для создания нового товара
// const newFurniture = {
//     name: "Example Product 7",
//     width: 200,
//     height: 150,
//     depth: 100,
//     firm: "Example Firm",
//     type: "шкаф",
//     colors: ["red", "blue", "green"],
//     price: 99.99,
//     url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAAB4CAYAAAD4z747AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFmSURBVHhe7dMhAQAwDASx+Xf8qLNxICAS8rYd0CQohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQtbuAxJwwGgIU+O3AAAAAElFTkSuQmCC",
//     time: "2024-04-27T13:27:43.244",
//     volume: 1000
// };


//проверка существования указанной категории
export async function checkCategoryExists(categoryName) {
    const url = '/api/categories/check-exists';

    const requestBody = {
        categoryName: categoryName
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    };

    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.exists) {
                console.log(`Категория ${categoryName} существует с ID: ${data.category.id} и названием: ${data.category.name}`);
                return { exists: true, category: data.category };
            } else {
                console.log(`Категория ${categoryName} не существует.`);
                return { exists: false, category: null };
            }
        })
        .catch(error => {
            console.error('Ошибка при выполнении запроса:', error);
            throw error;
        });
}

//функция для проверки на уникальность артикула
export async function checkIfArticleExists(article) {
    try {
        const response = await fetch(`/api/furniture/exists/${article}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data) {
            console.log(`Товар с артикулом ${article} существует.`);
            return false;
        } else {
            console.log(`Товар с артикулом ${article} не существует.`);
            return true;
        }
    } catch (error) {
        console.error('Ошибка при выполнении fetch запроса:', error);
        throw error;
    }
}


// Функция для поиска товаров по запросу
export async function searchFurniture(query) {
    try {
        const response = await fetch(`/api/furniture/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Search Results:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}


//получение списка размеров для фильтрации товаров
export function GetUniqueSizes(categories){
    const queryString = new URLSearchParams({
        categories: categories
    }).toString();
    const apiUrl = `/api/furniture/sizes?${queryString}`;
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Unique Sizes:', data);
            return data;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}






