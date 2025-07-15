import { addFurniture,IsValidAllInputs,getUserIsAuth, checkCategoryExists, checkIfArticleExists, toggleValidationClass, searchFurniture, deleteFurnitureByArticle, setUserIsAuth} from './module.js';
document.addEventListener('DOMContentLoaded', function () {

    const modal = document.getElementById("modal");
    const modalAddColor = document.getElementById('modalAddColor');
    const btnAddFurniture = document.querySelector(".btn_AddFurniture");
    const closeBtn = document.querySelector(".close");

    const articleInput = document.getElementById('sku');
    const nameInput = document.getElementById('name');
    const categoryInput = document.getElementById('category');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const depthInput = document.getElementById('depth');
    const manufacturerInput = document.getElementById('manufacturer');
    const priceInput = document.getElementById('price');
    const imageUrlInput = document.getElementById('imageUrl');
    const stockInput = document.getElementById('stock');
    const textarea = document.getElementById('description');
    const colorNameInput = document.getElementById('nameColor');
    const hexInput = document.getElementById('HexColor');

    const buttonExit = document.querySelector('.form_close');
    buttonExit.addEventListener('click',function(){
        setUserIsAuth(false);
        window.location.href = 'index.html';
    })


    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.addEventListener('input', function(event) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    });

    function CreateModal(modal){
        modal.style.display = "block";
        document.body.style.overflow = "hidden"
    }

    function CloseModal(modal){
        modal.style.display = "none";
        document.body.style.overflow = "auto";

    }
  
    btnAddFurniture.addEventListener("click", function(event) {
        CreateModal(modal);
        clearModalData(modal);
        clearModalColor();
    });

    closeBtn.addEventListener("click", function(event) {
        CloseModal(modal);
    });

    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            CloseModal(modal);
        }
        else if(event.target === modalAddColor){
            CloseModal(modalAddColor);
        }
    });


    IsValidAllInputs('.form_input textarea','.form_button');


    const submitButton = document.querySelector('.form_button');
    submitButton.addEventListener("click", AddFurniture);

    async function AddFurniture (event){
        event.preventDefault();
        let isValid=false, CategoryValidInfo;

        if (!submitButton.classList.contains("disabled")) {

            const isArticleValid = await checkIfArticleExists(articleInput.value) && isValidArticle(articleInput.value);
            const isNameValid = ValidateName(nameInput.value);
            const isWidthValid = ValidateSize(widthInput.value);
            const isHeightValid = ValidateSize(heightInput.value);
            const isDepthValid = ValidateSize(depthInput.value);
            const isColorsValid = ArrayColor.length > 0;
            console.log(isColorsValid,ArrayColor);
            const isManufacturValid = ValidateName(manufacturerInput.value);
            const isPriceValid = ValidatePrice(priceInput.value);
            const isImageURLlValid = ValidateUrl(imageUrlInput.value);
            const isVolumeValid = ValidateNum(stockInput.value);
            CategoryValidInfo = await checkCategoryExists(categoryInput.value.toLowerCase()); 
            const isDescriptionValid = ValidateDescription(textarea.value);

            isValid = isArticleValid && isNameValid && CategoryValidInfo.exists && isWidthValid && isHeightValid && isDepthValid && 
            isManufacturValid && isColorsValid && isPriceValid && isImageURLlValid && isVolumeValid && isDescriptionValid;

            console.log(isValid);

            toggleValidationMessage(articleInput, isArticleValid);
            toggleValidationMessage(nameInput, isNameValid);
            toggleValidationMessage(categoryInput, CategoryValidInfo.exists);
            toggleValidationMessage(widthInput, isWidthValid);
            toggleValidationMessage(heightInput, isHeightValid);
            toggleValidationMessage(depthInput, isDepthValid);
            toggleValidationMessage(manufacturerInput, isManufacturValid);
            toggleValidationMessage(priceInput, isPriceValid);
            toggleValidationMessage(imageUrlInput, isImageURLlValid);
            toggleValidationMessage(stockInput, isVolumeValid);
            toggleValidationMessage(textarea,isDescriptionValid);
            toggleValidationMessage(linkAddColor,isColorsValid);
        }
        
        if (!submitButton.classList.contains("disabled") && isValid) {
            const urls = splitСomma(imageUrlInput.value);

            const width = parseFloat(widthInput.value);
            const height = parseFloat(heightInput.value);
            const depth = parseFloat(depthInput.value);
            const volume = parseInt(stockInput.value);
            const price = parseFloat(priceInput.value);

            if (isNaN(width) || isNaN(height) || isNaN(depth) || isNaN(volume) || isNaN(price)) {
                console.error("Ошибка преобразования одного из значений.");
                return null;
            } else {
                const newFurniture =  {
                    "name": capitalizeFirstLetter(nameInput.value),
                    "width": width,
                    "height": height,
                    "depth": depth,
                    "firm": capitalizeFirstLetter(manufacturerInput.value),
                    "type": CategoryValidInfo.category,
                    "colors": ArrayColor,
                    "price": price,
                    "imageUrls": urls,
                    "time": getCurrentDateTimeFormatted(),
                    "volume": volume,
                    "article": articleInput.value,
                    "description": capitalizeFirstLetter(textarea.value)
                };
                console.log(newFurniture);
                addFurniture(newFurniture)
                 .then(data => {
                    CloseModal(modal);
                })
            }  
        }
    }

//search 
    const searchButton = document.querySelector('.search_btn');
    searchButton.addEventListener('click', async function (event){
        event.preventDefault();
        const searchQuery = document.getElementById('query').value;
        if (searchQuery) {
            let searchResults = await searchFurniture(searchQuery);
            console.log('Final Search Results:', searchResults);
            displaySearchResults(searchResults);
        }
    });
//AddColor
    const linkAddColor = document.getElementById('AddColor');
    let ArrayColor=[];

    linkAddColor.addEventListener('click', function (event){
        modalAddColor.style.zIndex='101';
        CreateModal(modalAddColor);
        CloseModal(modal);

        IsValidAllInputs('.form_input input','.form_button2');
    })

    const submitButton2 = document.querySelector('.form_button2');
    submitButton2.addEventListener('click', addColorHandler);

    function addColorHandler(event) {
        event.preventDefault();

        if (!submitButton2.classList.contains("disabled")) {
    
            // Валидация ввода
            const isValidNameColor = validateColorName(colorNameInput.value);
            const isValidHexColor = validateHexColor(hexInput.value);
    
            // Отображение сообщений о валидации
            toggleValidationMessage(colorNameInput, isValidNameColor);
            toggleValidationMessage(hexInput, isValidHexColor);
    
            // Если все данные валидны, добавить цвет
            if (isValidNameColor && isValidHexColor) {
                let ObjColor = {
                    "colorName": colorNameInput.value.toLowerCase(),
                    "colorHex": hexInput.value
                };
                ArrayColor.push(ObjColor);
                console.log(ArrayColor);
    
                // Закрытие и очистка модального окна
                CloseModal(modalAddColor);
                CreateModal(modal);
                clearModalData(modalAddColor);
    
                // Обновление списка цветов в интерфейсе
                PrintArrayColor(ArrayColor);
    
                // Обновление состояния кнопки добавления цвета
                toggleValidationMessage(linkAddColor, ArrayColor.length > 0);
            }
        }
    }

    function updateColor(index) {
        const isValidNameColor = validateColorName(colorNameInput.value);
        const isValidHexColor = validateHexColor(hexInput.value);
    
        toggleValidationMessage(colorNameInput, isValidNameColor);
        toggleValidationMessage(hexInput, isValidHexColor);
    
        if (isValidNameColor && isValidHexColor) {
            ArrayColor[index] = {
                "colorName": colorNameInput.value.toLowerCase(),
                "colorHex": hexInput.value
            };
            console.log(ArrayColor);
    
            PrintArrayColor(ArrayColor);
    
            CloseModal(modalAddColor);
            CreateModal(modal);
            clearModalData(modalAddColor);
    
            toggleValidationMessage(linkAddColor, ArrayColor.length > 0);
        }
    }
    

    function clearModalData(modal) {
        const inputs = modal.querySelectorAll('input, textarea');
        inputs.forEach(input => 
                input.value = ''
        );
    }

    function clearModalColor() {
        const resultsContainer = document.querySelector('.AllColorFurniture');
        resultsContainer.innerHTML = ''; 
        ArrayColor = [];
    }


    const modal_back = document.querySelector('.form_back');
    modal_back.addEventListener('click', function(event){
        modalAddColor.style.zIndex='10';
        CloseModal(modalAddColor);
        CreateModal(modal);
    })

    const modal_close = document.querySelector('.close_modal');
    modal_close.addEventListener('click',function(){
        modalAddColor.style.zIndex='10';
        CloseModal(modalAddColor);
        CreateModal(modal);
        clearModalData(modalAddColor);
    })

  //EditColor
  
window.addEventListener('click',function(event){
    const action = event.target.dataset.action;
    const index = event.target.dataset.index;

    if (action === 'EditColor' || action === 'DeleteColor') {
        if (index !== undefined) {
            const color = ArrayColor[index];
            const colorHex = color.colorHex;
            const colorName = color.colorName;

            if (action === 'EditColor') {
                console.log(`Editing color: Name = ${colorName}, HEX = ${colorHex}`);
                CloseModal(modal);
                CreateModal(modalAddColor);
                colorNameInput.value = colorName;
                hexInput.value = colorHex;
                submitButton2.removeEventListener('click', addColorHandler);
                submitButton2.addEventListener('click', () => updateColor(index));
            }

            if (action === 'DeleteColor') {
                console.log(`Deleting color: Name = ${colorName}, HEX = ${colorHex}`);
                ArrayColor.splice(index, 1);
                PrintArrayColor(ArrayColor);
            }
        }
    }
});

function PrintArrayColor(arrayColor){
    const resultsContainer = document.querySelector('.AllColorFurniture');
    resultsContainer.innerHTML = ''; 

    if (arrayColor.length !== 0) {
        const fragment = document.createDocumentFragment();
        arrayColor.forEach(color => {

            const conteiner = document.createElement('div');
            conteiner.className = 'conteinerColor';

            const paragraph = document.createElement('p');
            paragraph.className = 'ItemColor';

            const span = document.createElement('span');
            span.className = 'cricleColor';
            span.style.backgroundColor = color.colorHex;

            paragraph.appendChild(span);
            paragraph.appendChild(document.createTextNode(color.colorName));
            

            fragment.appendChild(paragraph);

            const link = document.createElement('div');
            link.className = 'Icons';

            const img = document.createElement('img');
            img.className = 'EditColor';
            img.dataset.action = 'EditColor';
            img.dataset.index = arrayColor.indexOf(color);
            img.src='/img/icons8-edit 1.png';
            img.alt="edit";

            const img2 = document.createElement('img');
            img2.className = 'DeleteColor';
            img2.dataset.action = 'DeleteColor';
            img2.dataset.index = arrayColor.indexOf(color);
            img2.src='/img/icons8-trash (1) 1.png';
            img2.alt="delete";

            link.appendChild(img);
            link.appendChild(img2);

            conteiner.appendChild(paragraph);
            conteiner.appendChild(link);
            
            fragment.appendChild(conteiner);

        });
        resultsContainer.appendChild(fragment);
    }
}

function displaySearchResults(furnitureList) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; 

    if (furnitureList.length === 0) {
        resultsContainer.innerHTML = `<p class="error-text">Не удалось найти ни одного товара :(</p>`;
    }
    else{
        furnitureList.forEach(furniture => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.article = furniture.article; 

            const colorElements = furniture.colors.slice(0, 2).map(color => 
                `<p class="conteinerColor"><span class="cardCricleColor" style="background-color: ${color.colorHex}"></span> ${color.colorName}</p>`
            ).join('');

            card.innerHTML = `
                <div class="right">
                    <img src="/img/icons8-trash (1) 1.png" alt="Delete" class="DeleteCard" data-action="delete"> 
                    <img src="/img/icons8-редактировать-26 (1).png" class="Edit">
                </div>
                <img src="${furniture.imageUrls[0]}" alt="${furniture.name}" class="card-img">
                <div class="card-body">
                    <div class="card-body-top row">
                        <h1 class="card-title">${furniture.name}</h1>
                        <p class="article">Артикул: ${furniture.article}</p>
                    </div>
                    <div class="card-body-bottom row">
                        <p class="card-text"><span>Категория</span> ${furniture.type.name}</p>
                        <p class="card-text"><span>Цена</span> ${furniture.price}₽</p>
                        <p class="card-text"><span>Наличие</span> ${furniture.volume}</p>
                        <p class="card-text"><span>Размер</span> ${furniture.width}X${furniture.height}X${furniture.depth} cm</p>
                        <div class="card-text"><span class="Margin">Цвета</span> ${colorElements}</div>
                        <p class="card-text"><span>Производитель</span> ${furniture.firm}</p>
                        <p class="card-text"><span>Добавлен</span> ${furniture.time}</p>
                        <p class="card-text"><span>Описание</span><span class="hidden">${furniture.description}</span></p>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(card);
        });

        // Добавляем обработчики событий для удаления товара
        resultsContainer.addEventListener('click', function(event) {
            const target = event.target;
            const action = target.dataset.action;
            const card = target.closest('.card');

            if (!card) return;

            const article = card.dataset.article;
            if (action === 'delete') {
                // deleteFurniture(article,furnitureList);
                console.log(`Deleting furniture with article: ${article}`);
                console.log(furnitureList);
                deleteFurnitureByArticle(article)
                    .then(() => {
                        console.log(`Furniture with article ${article} successfully deleted`);
                        card.remove();
                        alert(`Товар с артикулом: ${article} успешно удален!`);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert(`Не удалось удалить товар: ${error.message}`);
                    });
            }
        });
    } 
}
   
});



function ValidateDescription(description){
    if (description.length > 500) {
        return false;
    }
    return true;
}

function validateColorName(colorName) {
    const nameRegex = /^[а-яА-Я\s\-]{1,100}$/;
    return nameRegex.test(colorName) && colorName.length <= 100;
}

function validateHexColor(hex) {
    const hexRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    return hexRegex.test(hex);
}

function ValidateSize(size){
    var regex = /^(?!0(\.0+)?$)([1-9]\d*|0)(\.\d{1})?$/;
    return regex.test(size);
}

function ValidateNum(String){
    const width = parseInt(String);
    if (isNaN(width) || width < 0) {
        return false;
    } 
    return true;
}

function ValidateName(name){
    var regex = /^[A-Za-zА-Яа-яёЁ][A-Za-zА-Яа-яёЁ0-9\s]*$/;
    return regex.test(name) && name.length <= 255;
}

function ValidatePrice(price) {
    const regex = /^\d+(\.\d{1,2})?$/;
    return regex.test(price);
}

function ValidateUrl(url) {
    const regex = /^((https?:\/\/[\w\-\.]+(?:\/[\w\-.,@?^=%&:/~+#]*)*)?(?:,\s*(https?:\/\/[\w\-\.]+(?:\/[\w\-.,@?^=%&:/~+#]*)*)?)*)$/;
    return regex.test(url);
}

function splitСomma(input) {
    return input.split(',').map(word => word.trim());
}

function isValidArticle(article) {
    // Регулярное выражение для проверки формата category-color-seq
    const regex = /^[a-z]+-[a-z]+-\d+$/;
    return regex.test(article);
}

function toggleValidationMessage(input,IsValidInput) {

    toggleValidationClass(input,IsValidInput);

    const labelError = document.querySelector(`label[for="${input.id}"]`);

    if(!IsValidInput){
        labelError.style.display = 'flex';
    }
    else{
        labelError.style.display = 'none';
    }
}

function getCurrentDateTimeFormatted() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}
function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
