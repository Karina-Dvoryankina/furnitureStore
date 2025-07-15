import { checkAuth } from './auth.js';
import {loadFurnitureByCategories, LoginAddEventListner,HEART_STORAGE_KEY,CART_STORAGE_KEY,addAuthStateListener,updateAuthDependentElements, getUserIsAuth, ToogleButtonAuth, displayCountsHeader, scrollFixedHeader, GetUniqueColors, GetUniqueSizes, DisplayFurnitureCard, getCart, getCartLocal, getCachedFurniture} from './module.js';
const state = {
    offset: 0,
    limit: 6, 
    size: 0
};
const requestData = {
    typeNames: '',
    offset: '',
    limit: '',
    sort: '',
    colors: [],
    priceLow: null,
    priceHigh: null,
    sizes: []
};
const resultsContainer = document.querySelector('.furniture_list');
const div_download = document.querySelector('.Download');

document.addEventListener('DOMContentLoaded', async function () {

    //проверка авторизации пользователя
    checkAuth();

    addAuthStateListener((isAuth) => {
        ToogleButtonAuth();
        updateAuthDependentElements(isAuth);
    });

    // Обработчик для фиксации бордера шапки при скроле
    window.addEventListener('scroll', () => scrollFixedHeader());


    //обработчик активной категории товара
    const categoryItems = document.querySelectorAll('.li_kategor');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {

            categoryItems.forEach(el => el.classList.remove('kategor_active'));
            this.classList.add('kategor_active');

            div_download.classList.remove('disable');
            ClearStateResult();
            displayProductsForCategory(getActiveCategory());
        });
    });

    //вывожу товары активной категории
    displayProductsForCategory(getActiveCategory());


    //загрузить еще
    const btnDownloadMore = document.querySelector('.DownloadMore')
    btnDownloadMore.addEventListener('click', function(){
        const activeCategory = getActiveCategory();
        state.offset += state.limit;
        displayProductsForCategory(activeCategory);
    });

    //применяю активную сортировку к карточкам
    ApplyActiveSort();
    

    //обработчик клика на сортировку 
    document.querySelectorAll('.item_dropdown').forEach(item => {
        item.addEventListener('click', () => DisplayTogglePopUp(item))
    });
    

    // // добавляю обработчик события на способы сортировки
    document.querySelectorAll('.item_pop_up').forEach(item => {
        item.addEventListener('click', () => SelectSort(item), { once: true });
    })

    //обработчик клика кнопки применить фильтр 
    document.querySelectorAll('.filter_btn_apply').forEach(btn => {
        btn.addEventListener('click', () => ApplyFilter(btn));
    });


    //обработчик клика кнопки сбросить фильтр 
    document.querySelectorAll('.filter_btn_reset').forEach(btn => {
        btn.addEventListener('click', () => ResetFilter(btn));
    });

    //обработчик клика кнопки готово, применить фильтр цены
    const btn_done = document.querySelector('.filter_btn_done');
    btn_done.addEventListener('click', function (){
        const price_low = document.querySelector('#price_from').value;
        const price_high = document.querySelector('#price_to').value;

        if (price_low && price_high && price_high >= price_low) {

            requestData.priceLow = Number(price_low);
            requestData.priceHigh = Number(price_high);

            ClearStateResult();
            displayProductsForCategory(getActiveCategory());
        }
        else if(price_high < price_low){
            alert('Цена до должна быть больше цены от');
        }
        else{
            alert('Заполните поля, чтобы применить фильтр к товарам');
        }

        const type = btn_done.classList[1];
        const item_dropdown = document.querySelector(`[data-type="${type}"] .active_item_dropdown`);
        DisplayTogglePopUp(item_dropdown);
    });

    //обработчик клика кнопки перейти в избранное
    document.querySelector('.action_heart').addEventListener('click', function (){
        window.location.href = 'favorite.html';
    });

    //выводим счетчики количества товаров в шапке для избранного
    displayCountsHeader(HEART_STORAGE_KEY);

    //обработчик клика кнопки перейти в корзину
    document.querySelector('.action_basket').addEventListener('click', function (){
        window.location.href = 'basket.html';
    });

    //выводим счетчики количества товаров в шапке для корзины
    displayCountsHeader(CART_STORAGE_KEY);

    // Клик на кнопку войти
    const voitiClick = document.querySelector('.voiti_click');
    LoginAddEventListner(voitiClick);
});


//сброс состояний пагинации и контейнера для вывода карточек
function ClearStateResult(){
    state.offset = 0;
    state.size = 0;
    resultsContainer.innerHTML = ''; 
}

//сброс фильтрации
function ResetFilter(btn){

    const type = btn.classList[1];
    const popUp = document.querySelector(`.pop_up.${type}`);
    const checkboxes = popUp.querySelectorAll('.custom-checkbox:checked');

    const checkedCount = checkboxes.length;
    if(checkedCount !== 0){
        // Сбрасываем все чекбоксы
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Очищаем выбранные фильтры в requestData
        switch (type) {
            case 'color':
                requestData.colors = [];
                break;
            case 'size':
                requestData.sizes = [];
                break;
            default:
                console.log('Not found filter type for reset');
                break;
        }

        // Обновляем счетчик выбранных фильтров
        const counterSpan = document.querySelector(`.count.${type}`);
        counterSpan.classList.remove('count_active');
        counterSpan.textContent = 0;

         // Сбрасываем фильтрованные результаты
        ClearStateResult();
        displayProductsForCategory(getActiveCategory());
    }

    // Закрываем поп-ап
    const item_dropdown = document.querySelector(`[data-type="${type}"] .active_item_dropdown`);
    DisplayTogglePopUp(item_dropdown);
}


//применение фильтрации
function ApplyFilter(btn){

    const type = btn.classList[1];
    const popUp = document.querySelector(`.pop_up.${type}`); 
    const checkboxes = popUp.querySelectorAll('.custom-checkbox:checked');


    const checkedLabels = [];
    checkboxes.forEach(checkbox => {
        const label = popUp.querySelector(`label[for="${checkbox.id}"]`); 
        if (label) {
            checkedLabels.push(label.textContent.trim());
        }
    });
    

    const checkedCount = checkboxes.length;
    if(checkedCount !== 0){

        const counterSpan = document.querySelector(`.count.${type}`); 
        counterSpan.classList.add('count_active');

        counterSpan.textContent = checkedCount;

        switch (type) {
            case 'color':
                requestData.colors = checkedLabels;
                break;
            case 'size':
                requestData.sizes = checkedLabels;
                break;
            default:
                console.log('Not found filter');
                break;
        }
        ClearStateResult();
        displayProductsForCategory(getActiveCategory());
    }

    const dropdown = document.querySelector(`[data-type="${type}"]`);
    const item_dropdown = dropdown.querySelector('.active_item_dropdown');
    DisplayTogglePopUp(item_dropdown);
 
}

// Обработчик кликов по документу для закрытия поп-апа
document.addEventListener('click', function(event) {
    const activePopUp = document.querySelector('.pop_up.pop_up_active');
    
    if (activePopUp && !activePopUp.contains(event.target) && !event.target.closest('.active_item_dropdown')) {
        const dropdown = GetDropdownDataType(activePopUp);
        activePopUp.classList.remove('pop_up_active');
        StrelkaToggleClassRotate(activePopUp,dropdown);
    }
});

//получить dropdown зная активный pop-up
function GetDropdownDataType(activePopUp){
    return document.querySelector(`[data-type="${activePopUp.classList[1]}"]`);
}

//поворот стрелки при открытии поп-апа
function StrelkaToggleClassRotate(pop_up_type,dropdown){
    const strelka = dropdown.querySelector('.strelka');
    strelka.classList.toggle('rotate',pop_up_type.classList.contains('pop_up_active'));
}

//применяем активную сортировку
function ApplyActiveSort(){
    const activeSort = getActiveSort();
    requestData.sort = activeSort.classList[1];
}

//функция для отображения карточек товаров
export function DisplayFurnitureByCatedory(listFurniture,resultContainer){
    const filterNone = document.querySelector('.category_filter');
    const div_download = document.querySelector('.Download');
    console.log(listFurniture.length);
    if (listFurniture.length !== 0) {

        filterNone.classList.remove('disable');

        DisplayFurnitureCard(listFurniture,resultContainer)

        if (div_download.classList.contains('disable')) {
            div_download.classList.remove('disable');
        }
    }
    else{
        console.log("Ни одного товара не найдено!");

        div_download.classList.add('disable');
        const p = document.querySelector('.textResultLoadMore')
        p.textContent = `Показано ${state.size}/${state.size} результатов`;
        div_download.appendChild(p);

        if (state.size === 0) {
            filterNone.classList.add('disable');
        }
    }
}

//отобразить поп-ап
function DisplayTogglePopUp(item_dropdown){

    const dropdown = item_dropdown.closest('.dropdown');
    const type = dropdown.dataset.type;
    const pop_up_type = document.querySelector(`.pop_up.${type}`);


    document.querySelectorAll('.pop_up').forEach(pop_up => {
        if (pop_up !== pop_up_type) {
            pop_up.classList.remove('pop_up_active');
            StrelkaToggleClassRotate(pop_up,GetDropdownDataType(pop_up));
        }
    });
    pop_up_type.classList.toggle('pop_up_active');


    if (pop_up_type.classList.contains('pop_up_active')) {
        const leftPosition = dropdown.getBoundingClientRect().left;
        pop_up_type.style.left = `${leftPosition}px`;
    }

    StrelkaToggleClassRotate(pop_up_type,dropdown);
}

//выбор сортировки 
function SelectSort(item_dropdown){
    const mark = document.querySelectorAll('.mark');
    mark.forEach(svg => {
        svg.classList.remove('cheked_radio');
    });
    item_dropdown.querySelector('.mark').classList.add('cheked_radio');

    const dropdown = document.querySelector(`.dropdown[data-type="sort"]`);
    dropdown.querySelectorAll('.item_dropdown').forEach(item => {
        item.classList.remove('active_item_dropdown');
    });

    const item_active = document.querySelector(`.item_dropdown.${item_dropdown.classList[1]}`);
    item_active.classList.add('active_item_dropdown');
    ApplyActiveSort();
    ClearStateResult();
    DisplayTogglePopUp(item_active);
    displayProductsForCategory(getActiveCategory());
}

// функция для отображения товаров по активной категории
function displayProductsForCategory(category) {

    if (category === 'sofa') {
        requestData.typeNames = ['диван','кресло','кровать'];
    }
    if (category === 'table') {
        requestData.typeNames = ['стул','стол'];
    }
    if(category === 'chest'){
        requestData.typeNames = ['тумба','комод'];
    }
    if (category === 'shkaf') {
        requestData.typeNames = ['шкаф'];
    }
    requestData.offset = state.offset;
    requestData.limit = state.limit;
    loadFurnitureByCategories(requestData)
        .then(data => {
            console.log(data);
            DisplayFurnitureByCatedory(data.content,resultsContainer);
            state.size += data.content.length;
            console.log(state);
    });

    //вывожу доступные цвета активной категории в pop_up
    GetUniqueColors(requestData.typeNames)
    .then(data => {
        DisplayPopUp(document.querySelector('.pop_up.color'),data);
    });

    //вывожу доступные размеры активной категории в pop_up
    GetUniqueSizes(requestData.typeNames)
    .then(data => {
        DisplayPopUp(document.querySelector('.pop_up.size'),data);
    });
}


//функция для отображения доступных элементов фильтрации товара в поп-ап
function DisplayPopUp(pop_up,data){

    const type = pop_up.classList[1];
    const result = pop_up.querySelector('.conteiner_checkbox');
    result.innerHTML='';

    if (data.length !== 0) {
        data.forEach(item => {

            const conteiner = document.createElement('div');
            conteiner.className = 'checkbox';


            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `${type}_${data.indexOf(item)}`;
            input.className = 'custom-checkbox';


            if (type === 'color' && requestData.colors.includes(item.colorName)) {
                input.checked = true;
            } else if (type === 'size' && requestData.sizes.includes(`${item.width} x ${item.height} x ${item.depth}`)) {
                input.checked = true;
            }


            const lable = document.createElement('label');
            lable.htmlFor = input.id;


            if (type === 'color') {
                const cricle = document.createElement('span');
                cricle.className = 'cricle';
                cricle.style.backgroundColor = item.colorHex;

                const textNode = document.createTextNode(item.colorName);

                lable.appendChild(cricle);
                lable.appendChild(textNode);
            }
            else if (type === 'size'){
                lable.textContent = `${item.width} x ${item.height} x ${item.depth}`;
            }


            result.appendChild(conteiner);

            conteiner.appendChild(input);
            conteiner.appendChild(lable);
        });
    }
}


//функция для получения активной категории товара 
function getActiveCategory() {
    const activeItem = document.querySelector('.li_kategor.kategor_active');
    return activeItem ? activeItem.getAttribute('data-type') : null;
}


//функция для получения активном способе сортировки
function getActiveSort() {
    const activeSort = document.querySelector('.active_item_dropdown');
    return activeSort ? activeSort : null;
}

 

//Функция для увеличения объема конкретного товара, похзоляет добавить заданный объем по id товара
function changeVolume(furnitureId, volume) {
    const url = '/api/furniture/changeVolume';
    const data = {
        furnitureId: furnitureId,
        volume: volume
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); 
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


//Функция для возврата изображений из галереи интерьеров, необходимо передать id галлереи в data сохраняется вся информация
// которую вернул сервер
function getGalleryData(id) {
    const url = `/api/galleries/${id}`;
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Gallery Data:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//Функция покупки товара, в нее должен передаваться массив id товаров, которые пользователь хочет купить
async function buyFurniture(furnitureIds) {
    const url = '/api/furniture/buyFurniture';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(furnitureIds)
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Success:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}



// Изменение рейтинга товара (работает как лайк, добавляет +1)
function changeFurnitureRating(rating) {
    const url = '/api/furniture/changeRating';
    const data = {
        rating: rating
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) { 
                const response = JSON.parse(xhr.responseText);
                console.log('Response:', response);
            } else {
                console.error('Error:', xhr.status, xhr.statusText);
            }
        }
    };

    xhr.send(JSON.stringify(data));
}



 
//Функция для создания галлереи изображений, пример данных, передаваемых в функцию, ниже
  function CreateGallery(data) {
    const url = '/api/galleries/add';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(sortedData => {
            console.log('Sorted Data:', sortedData);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

let informationAboutGallery = {
	"name": "Название галереи",
    "type": "Тип галереи",
	"imageUrls": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAAB4CAYAAAD4z747AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFmSURBVHhe7dMhAQAwDASx+Xf8qLNxICAS8rYd0CQohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQtbuAxJwwGgIU+O3AAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAAB4CAYAAAD4z747AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFmSURBVHhe7dMhAQAwDASx+Xf8qLNxICAS8rYd0CQohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQtbuAxJwwGgIU+O3AAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAAB4CAYAAAD4z747AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFmSURBVHhe7dMhAQAwDASx+Xf8qLNxICAS8rYd0CQohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQpigECYohAkKYYJCmKAQJiiECQphgkKYoBAmKIQJCmGCQtbuAxJwwGgIU+O3AAAAAElFTkSuQmCC"]
}


