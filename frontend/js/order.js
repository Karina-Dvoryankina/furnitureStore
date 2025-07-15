import {LoginAddEventListner,calcTotalSumCart,getGoodsWord,removeLocalStorage, ToogleButtonAuth, addAuthStateListener, handleColorClick, HEART_STORAGE_KEY,CART_STORAGE_KEY, getSelectedColor, responseProcessingSync, getFurnitureById, getUserIsAuth, svgIcons, createElement, displayCountsHeader, getCart, saveCart, isCartItem, handleHeartClick, UpdateCart, getCartLocal, request} from './module.js';
import { checkAuth } from './auth.js';

const makingForm = document.getElementById('form-making');
const API_KEY = "4db6762b084bd8526415996044472574ec366534";
const addressInput = document.getElementById("address-input");
const checkboxSaveAdress = document.querySelector('input[type="checkbox"][name="saveAddress"]');
const addressInputNumber = document.querySelectorAll('input[type="number"].group_address_delivery');
const addressPickup = ['Новорижское ш., 23 км от МКАД, д. Захарово'];

document.addEventListener('DOMContentLoaded', async function (){

    //проверка авторизации пользователя
    ensureUserAuth();

    //border header
    const nav = document.querySelector('nav');
    nav.classList.add('fixed_border');

    //обработчик клика кнопки перейти в избранное
    document.querySelector('.action_heart').addEventListener('click', function (){
        window.location.href = 'favorite.html';
    });

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

    // Токен DaData 
    hintInputAdress();   

    orderDraft.init();

    //прослушиваем выбор способа доставки
    document.querySelectorAll('input[type="radio"][name="delivery"]').forEach(input => {
        input.addEventListener('change', async (e) => {
            try {
                await SelectMethodDelivery(e.target);
            } catch (error) {
                console.error('Ошибка выбора метода доставки', error);
            }
        });
    })

    //прослушиваем отправку формы
    makingForm.addEventListener('submit', handleFormSubmit);

    //показываем кастомный тултип если инпут пустой
    makingForm.querySelectorAll('[required]').forEach(input => {
        input.addEventListener('invalid',(e) => {
            console.log('even');
            e.preventDefault();
            ToggleShowError(e.target,'Поле обязательно для заполнения');
        })
    });

    //прослушивание клика на чекбокс сохранить адрес доставки
    checkboxSaveAdress.addEventListener('change', async (e) => {
        const isSave = checkSaveAdress();
        orderDraft.saveAddress = isSave;
        if(isSave){
            const address = getFullAddress(makingForm);
            if (!address.length) {
                ToggleShowError(addressInput, 'Поле обязательно для заполнения');
                SetCheckedCheckbox(e.target,false);
                return;
            }
            try {
                await SaveAddressDelivery(addressToString(address));
                SetAddressDelivery(address);
            } catch (error) {
                console.error('Ошибка сохранения адреса');
                SetCheckedCheckbox(e.target, false);
                return;
            }
        }
        else{
            try {
                await DeleteAddressDelivery();
                SetAddressDelivery([]);
            } catch (error) {
                console.error('Ошибка удаления адреса')
                SetCheckedCheckbox(e.target, true); 
                return;
            }
        }
    });

    //прослушиваем выбор способа оплаты
    document.querySelectorAll('input[type="radio"][name="pay"]').forEach(input => {
        input.addEventListener('change',(e) => SelectPayment(e.target));
    })

    await fillCardSumOrder();

    showRecipientInfo();

});

//заполняем блок суммы заказа данными корзины
async function fillCardSumOrder(){
    try {
        const cart = await getCartLocal(CART_STORAGE_KEY);

        const fieldCount = document.querySelector('.quantity');
        const fieldDeliveryPrice = document.querySelector('.delivery-price');
        const fieldTotalSum = document.querySelector('.totalSum');
        const fieldTotalPrice = document.querySelector('.total-price');

        const resCalc = calcTotalSumCart(cart);
        const totalWithDelivery = resCalc.totalSum + orderDraft.deliveryPrice;

        fieldTotalPrice.textContent = toLocaleStringPrice(resCalc.totalSum);
        fieldCount.textContent = `${resCalc.totalCount} ${getGoodsWord(resCalc.totalCount)}`;
        fieldDeliveryPrice.textContent = toLocaleStringPrice(orderDraft.deliveryPrice);
        fieldTotalSum.textContent = toLocaleStringPrice(totalWithDelivery);
    } catch (error) {
        console.error('Не удалось рассчитать сумму заказа', error);
    }
}

function toLocaleStringPrice(price){
    return `${Number(price).toLocaleString('ru-RU')} ₽`;
}

//проверка авторизации
async function ensureUserAuth() {
    checkAuth();
    if (!getUserIsAuth()) {
        window.location.href = 'vhod.html';
    }
}

function SelectPayment(input){
    orderDraft.payment = input?.value || null;
    orderDraft.save();
}

async function saveRecepientInfoToDraft(){
    try{
        const dataUser = await getRecipientInfo();
        console.log(dataUser);
        if (!dataUser) {
            throw new RecepientExceptions();
        }
        const {firstName,lastName,phoneNumber} = dataUser;
        orderDraft.recipient = {firstName,lastName,phoneNumber};

        const address_split = splitAddress(dataUser.address);
        SetAddressDelivery(address_split);
        addressInput.dataset.selectHint = 'true';

        orderDraft.save();
        orderDraft.applyBlockAddressToDOM();

        return true;
    }
    catch (e){
        console.error('Ошибка при получении данных получателя!');

        orderDraft.recipient = {};
        orderDraft.save();

        return false;
    }
}



async function getRecipientInfo() {
    try {
        const data = await request('http://localhost:8081/api/recipient-info');
        console.log("Имя:", data.firstName, "Фамилия:", data.lastName, "Телефон:", data.phoneNumber);
        return data;
    } catch (e) {
        console.error("Ошибка при получении информации о получателе:", e.message);
        return null;
    }
}

function showRecipientInfo() {
    const dataUser = orderDraft.recipient;
    console.log(dataUser);
    if(!isEmpty(dataUser)){
        const fieldName = document.querySelector('.recipient-name');
        const fieldPhone = document.querySelector('.recipient-phone');
        
        fieldName.textContent = `${dataUser.lastName} ${dataUser.firstName}`;
        fieldPhone.textContent = dataUser.phoneNumber;

        console.log(orderDraft.address);
        fillFieldAddress(orderDraft.address);

        return;
    }
    if(!saveRecepientInfoToDraft()) {
        const blockRecipient = document.querySelector('.cardRecipient-info');
        const error = createElement('p','error');
        error.textContent = 'Не удалось получить данные';
        blockRecipient.appendChild(error);

        const iconPath = document.querySelector('.icon-path');
        iconPath.style.fill = '#ff5623';

        return;
    }
    showRecipientInfo()
}

function isEmpty(obj) {
    return JSON.stringify(obj) === '{}';
  }

async function SaveAddressDelivery(address) {
    try {
        const result = await request('http://localhost:8081/api/save-address', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            data: { address }
        });

        if (result.status === "success") {
            console.log("Адрес успешно сохранён");
        } else {
            console.warn("Неожиданный ответ от сервера:", result);
        }
    } catch (e) {
        console.error("Ошибка при сохранении адреса:", e.message);
    }
}

async function DeleteAddressDelivery() {
    try {
        const result = await request('http://localhost:8081/api/delete-address', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (result.status === "success") {
            console.log("Адрес успешно удалён");
        } else {
            console.warn("Неожиданный ответ от сервера:", result);
        }
    } catch (e) {
        console.error("Ошибка при удалении адреса:", e.message);
    }
}


function SetAddressDelivery(address){
    orderDraft.address = address;
    orderDraft.save();
}

function SetCheckedCheckbox(checkbox,value){
    checkbox.checked = value;
}

// выводим сообщение об ошибки для инпутов адреса доставки
function ToggleShowError(input, message = null){
    const parentBlock = input.closest('.group');
    const bar_error = parentBlock.querySelector('.bar');
    console.log(message);
    bar_error.textContent = message;
    bar_error.classList.toggle('error', message);
}


//отправка формы оформления заказа
async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Отправка!');

    if (!await ValidateFormMaking()) return;

    try{
        // Отправляем запрос на сервер
        const response = await submitOrder();
        // Обрабатываем успешный ответ
        handleSuccessResponse(response);
    }
    catch (error){
        console.error('Ошибка при оформлении заказа:', error);
    }
}


function handleSuccessResponse(response) {
    console.log('Заказ успешно создан:', response);
    
    alert('Ваш заказ успешно оформлен! Номер заказа: ' + response.orderId, 'success');
    
    clearCart();
    orderDraft.clear();

    window.location.href = 'index.html';
}

function clearCart(){
    removeLocalStorage(CART_STORAGE_KEY);
    displayCountsHeader(CART_STORAGE_KEY);
}

// Отправка заказа на сервер
async function submitOrder() {
    console.log(orderDraft.prepareForSubmit());
    const url = 'http://localhost:8081/api/orders/create';
    return await request(url, {
        method: 'POST',
        data: orderDraft.prepareForSubmit()
    });
}


//валидация формы перед отправкой
async function ValidateFormMaking(){
    let isValid = true;

    // 1. Проверка корзины
    if (orderDraft.cart.length <= 0) {
        alert('Корзина пуста! Добавьте товары в корзину')
        return false;
    }

    // 2. Проверка способа доставки
    if (!orderDraft.delivery) {
        alert('Выберите способ доставки');
        return false;
    }

    if (orderDraft.delivery === 'delivery' && orderDraft.deliveryPrice <= 0) {
        alert('Не удалось рассчитать стоимость доставки. Повторите попытку позже')
        return false;
    }

    // 3. Проверка способа оплаты
    if (!orderDraft.payment) {
        alert('Выберите способ оплаты');
        return false;
    }

    // 4. Проверка адреса для доставки
    if (orderDraft.delivery === 'delivery') {

         // Проверяем, что адрес был выбран из подсказок Dadata
        const addressSelected = addressInput.dataset.selectHint === 'true';
        if (!addressSelected) {
            ToggleShowError(addressInput, 'Выберите адрес из списка подсказок');
            return false;
        }

        // Дополнительная проверка перед отправкой
        if (!isAdressComplete(addressInput.value)) {
            ToggleShowError(addressInput, 'Адрес должен содержать город, улицу и дом');
            return false;
        }

        ToggleShowError(addressInput);
    }

    // 5. Проверка данных получателя
    if (Object.keys(orderDraft.recipient).length <= 0) {
        alert('Не удалось получить данные о получателе. Повторите авторизацию')
        isValid = false;
    }

    return isValid;
}


//проверка адреса на обязательные состовляющие - регион,улица,дом
function isAdressComplete(address){

    const hasRegion = /(^|, )(республика |область |край |г )/.test(address);
    const hasStreet = /(ул(ица)? |проспект |пр-кт |бульвар |б-р |ш(оссе)? |наб(ережная)? |пл(ощадь)? |аллея |пер(еулок)? |тупик |проезд )/.test(address);
    const hasHouse = /(д(ом)? |стр(оение)? |вл(адение)? |корп(ус)? |лит(ер)? )\d+/i.test(address);

    return hasRegion && hasStreet && hasHouse;
}

//получить полный адрес доставки
function getFullAddress(formNode){
    const {elements} = formNode;

    return (Array.from(elements)
        .filter(input => input.classList.contains('group_address_delivery'))
        .map(input => input.value.trim())
        .filter(Boolean));
}

function splitAddress(addressString) {
    if (typeof addressString !== 'string') return [];

    const parts = addressString.split(',').map(p => p.trim());

    if (parts.length <= 3) return [addressString];

    const mainPart = parts.slice(0, 3).join(', ');
    const restParts = parts.slice(3).map(part => {
        const match = part.match(/\d+/);
        return match ? match[0] : '';
    });

    return [mainPart, ...restParts];
}

function fillFieldAddress(address){
    const {elements} = makingForm;

    Array.from(elements)
        .filter(input => input.classList.contains('group_address_delivery'))
        .map((input,index) => 
            {
                input.value = address[index] || '';
            })
        .filter(Boolean);
}

function addressToString(address){
    const addressLabels = ['','кв ', 'подъезд ', 'этаж '];

    return address.map((value,index) => 
    {
        const label = addressLabels[index];
        return value ? (label ? `${label}${value}` : value) : null;
    })
    .join(', ');
}

async function SelectMethodDelivery(input) {
    const method = input?.value || null;
    
    // Обновляем данные в orderDraft
    orderDraft.delivery = method;
    orderDraft.updateDeliveryPrice();

    showRecipientInfo();
    
    // Обновляем UI
    updateDeliveryUI(method);
    
    // Сохраняем изменения
    orderDraft.save();
    
    // Обновляем итоговую стоимость
    await fillCardSumOrder();
}

function updateDeliveryUI(method) {
    const deliveryBlock = document.querySelector('.block-address_delivery');
    const pickupBlock = document.querySelector('.block-address_pickup');
    const class_selectBlock = 'select_delivery';

    if (method === 'delivery') {
        deliveryBlock.classList.add(class_selectBlock);
        pickupBlock.classList.remove(class_selectBlock);

        saveRecepientInfoToDraft();
    } else {
        pickupBlock.classList.add(class_selectBlock);
        deliveryBlock.classList.remove(class_selectBlock);

        SetAddressDelivery(addressPickup);
        orderDraft.applyBlockAddressToDOM();
    }
}


// проверяем нажат ли чекбокс сохранения адреса
function checkSaveAdress() {
    return checkboxSaveAdress.checked;
}


//черновик с данным для оформления заказа
const orderDraft = {
    delivery: null,
    deliveryPrice: 0,
    address: [],
    payment: null,
    saveAddress: false,
    recipient: {},
    cart:[],

    init() {
        this.load(); 
        this.fixCartInOrder();
        this.applyToDOM(); 
    },

    fixCartInOrder(){
        this.cart = getCartLocal(CART_STORAGE_KEY) || [];
        this.save();
    },

    updateDeliveryPrice() {
        const oldPrice = this.deliveryPrice;
        this.deliveryPrice = this.delivery === 'delivery' ? 1000 : 0;
        if (oldPrice !== this.deliveryPrice) {
            this.save();
        }
    },

    save() {
        const dataToSave = {
            delivery: this.delivery,
            deliveryPrice: this.deliveryPrice,
            address: this.address,
            payment: this.payment,
            saveAddress: this.saveAddress,
            recipient: this.recipient,
            cart: this.cart,
        };
        localStorage.setItem('orderDraft', JSON.stringify(dataToSave));
    },

    load() {
        const savedData = JSON.parse(localStorage.getItem('orderDraft'));
        if (savedData) {
            this.delivery = savedData.delivery || null;
            this.deliveryPrice = savedData.deliveryPrice || 0;
            this.address = savedData.address || [];
            this.payment = savedData.payment || null;
            this.saveAddress = savedData.saveAddress || false;
            this.recipient = savedData.recipient || {};
            this.cart = savedData.cart || [];
        }
    },

    applyToDOM() {
        if(this.delivery) {
            const inputDelivery = document.querySelector(`input[name="delivery"][value="${this.delivery}"]`);
            SetCheckedCheckbox(inputDelivery,true);
            SelectMethodDelivery(inputDelivery);
        }

        this.applyBlockAddressToDOM();

    },

    applyBlockAddressToDOM() {
            this.updateDeliveryPrice();

            SetCheckedCheckbox(checkboxSaveAdress,this.saveAddress);

            if(this.delivery === 'delivery'){
                const {elements} = makingForm;
                Array.from(elements)
                    .filter(input => input.classList.contains('group_address_delivery'))
                    .map((input,index) => {
                        input.value = 
                            this.address.length ? 
                            this.address[index] : null
                    });      
            }

            
    },

    clear() {
        this.delivery = null;
        this.deliveryPrice = 0;
        this.address = [];
        this.payment = null;
        this.saveAddress = false;
        this.recipient = {};
        this.cart = [];
        localStorage.removeItem('orderDraft');
    },

    prepareForSubmit() {
        return {
            deliveryType: this.delivery, 
            paymentMethod: this.payment,
            deliveryAddress: addressToString(this.address),
            deliveryPrice: this.deliveryPrice,
            cart: this.cart
        }
    }
};

//функция для отображения подсказок при вводе адреса
function hintInputAdress(){
    const wrapper = document.getElementById('suggestions-wrapper');

    // Создаем контейнер для подсказок адреса
    const suggestionsList = createElement('ul','suggestions');
    wrapper.appendChild(suggestionsList);

    // Скрываем подсказки адреса при клике вне поля
    document.addEventListener("click", function(e) {
        if (e.target !== addressInput) {
        suggestionsList.innerHTML = "";
        }
    });

    // Обработчик ввода адреса
    addressInput.addEventListener("input", function(e) {
        addressInput.dataset.selectHint = 'false';
        const query = e.target.value.trim();
        if (query.length < 3) {
            suggestionsList.innerHTML = "";
            return;
        }

        // Запрос к DaData API
        fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token " + API_KEY
        },

        body: JSON.stringify(
            { query: query, 
              count: 5,
              from_bound: { value: "city" },
              to_bound: { value: "house" }  
            })})

        .then(response => response.json())

        .then(data => {
            suggestionsList.innerHTML = "";
            data.suggestions.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.value;
            li.addEventListener("click", () => {
                addressInput.value = item.value;
                addressInput.dataset.selectHint = "true"; 
                suggestionsList.innerHTML = "";
                console.log("Выбрано:", item.data);
            });
            suggestionsList.appendChild(li);
            });
        })

        .catch(error => console.error("Ошибка:", error));
    });
}