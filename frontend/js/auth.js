import { AddEventListenerAllInput,Logout,ToogleButtonAuth, IsEmptyAllFilled, HEART_STORAGE_KEY, CART_STORAGE_KEY, syncLocalCartsWithServer, setUserIsAuth, getUserIsAuth, toggleValidationClass} from './module.js';
document.addEventListener('DOMContentLoaded', function () {
if (window.location.pathname.includes('vhod.html')) {
    const formInputs = document.querySelectorAll('.form_input input');
    const submitButton = document.querySelector('.form_button');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const emailInput = document.getElementById('vhodEmail');
    const passwordInput = document.getElementById('vhodPassword');

    if (getRememberMe()) {
        const rememberedEmail = getRememberedEmail();
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
        }
        rememberMeCheckbox.checked = true;
        submitButton.classList.toggle('disabled', true);
    }

    AddEventListenerAllInput(formInputs,validateForm);

    function validateForm() {
        const allFilled = IsEmptyAllFilled(formInputs);
        submitButton.classList.toggle('disabled',!allFilled);
        console.log({
            allFilled
        });
    }  

    submitButton.addEventListener('click', function () {
    
        let authData = {
            "email": emailInput.value,
            "password": passwordInput.value
        };
    
        console.log(authData.email, authData.password);
    
        Auth(authData)
            .then(response => {      

                setUserIsAuth(true);
                console.log(getUserIsAuth());

                //запрос на добавление товаров в корзину и избранное из локального списка (если он не пуст) 
                // syncLocalCartsWithServer('basket');
                // syncLocalCartsWithServer('heart');

                toggleValidationClass(emailInput, true);
                toggleValidationClass(passwordInput, true);
    
                if (rememberMeCheckbox.checked) {
                    setRememberMe(authData.email, true);
                    setAcessToken(response.accessToken);
                    setRefreshToken(response.refreshToken, 7)
                    console.log('njrty',response.accessToken,response.refreshToken);
                } else {
                    setRememberMe('', false); 
                    setAcessToken(response.accessToken);
                    setRefreshToken(response.refreshToken, 7)
                }
                
                console.log("Вы успешно авторизированы!");
                alert("Вы успешно авторизированы!");
                if (response.role !== 'admin') {
                    calbackPageOrderOrMain();
                } else {
                    window.location.href = 'AdminPanel.html';
                }
            })
            .catch(error => {
                console.error('Ошибка авторизации:', error); 
                alert(error.message);
                toggleValidationClass(emailInput, false);
                toggleValidationClass(passwordInput, false);
            });
    });
}
});

function calbackPageOrderOrMain(){
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');

    if (redirect === 'checkout' && sessionStorage.getItem('returnUrl')) {
        window.location.href = sessionStorage.getItem('returnUrl');
        sessionStorage.removeItem('returnUrl');
    }
    else{
        window.location.href = 'index.html';
    }
}


function setRememberMe(email, remember) {
    if (remember) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('email', email); 
    } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('email');
    }
}

function getRememberMe() {
    return localStorage.getItem('rememberMe') === 'true';
}

function getRememberedEmail() {
    return localStorage.getItem('email'); 
}

function setRefreshToken(value, days){
    setCookieSecure('refreshToken', value, days);
}

function setCookieSecure(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;Secure;SameSite=Strict";
}

function getCookie(name) {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const cookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
}

//проверка авторизации по рефреш токену
export async function checkAuth() {
    if (!getUserIsAuth()) {
        await checkRefreshToken();
    }
    ToogleButtonAuth();
}

// Функция для выполнения запросов с авторизацией
export async function fetchWithAuth(url, options = {}) {
    const accessToken = getAcessToken();
    console.log(accessToken);
    
    // Добавляем токен в заголовок
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    try {
        let response = await fetch(url, options);
        
        // Если токен истек
        if (response.status === 401) {
            const refreshToken = getCookie('refreshToken');
            console.log(refreshToken);
            // Пытаемся обновить токен
            const refreshResponse = await fetch('/api/refreshToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });
            
            if (refreshResponse.ok) {
                console.log('удалось через рефреш');
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshResponse.json();
                
                // Сохраняем новые токены
                setAcessToken(newAccessToken);
                setRefreshToken(newRefreshToken, 7);
                
                // Повторяем исходный запрос с новым токеном
                options.headers.Authorization = `Bearer ${newAccessToken}`;
                return fetch(url, options);
            } else {
                console.error('refresh не удался')
                Logout();
                window.location.href = '/vhod.html';
                return;
            }
        }
        return response;
    } catch (error) {
        console.error('Ошибка сети:', error);
        throw error;
    }
}


//auth
export async function Auth(data) {
    const url = '/api/login';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    return await fetch(url, options)
        .then(async response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
                });
            }
            return await response.json();
        })
        .then(data => {
            if (!data.accessToken) {
                throw new Error('Аccess токен отсутствуют в ответе сервера');
            }

            console.log('Успешная авторизация:', data);
            return data;
        })
        .catch(error => {
            console.error('Ошибка авторизации:', error.message);
            throw error;
        });
}

//установить токен авторизации
export function setAcessToken(accessToken) {
    setSessionStorage('AcessToken', accessToken);
}

export function removeAcessToken(){
    sessionStorage.removeItem('AcessToken');
}

export function removeCookie(name){
    setCookieSecure(name, '', -1);
}


//получить токен авторизации
export function getAcessToken(){
    return getSessionStorage('AcessToken');
}

export function getSessionStorage(name){
    return sessionStorage.getItem(name);
}

export function setSessionStorage(name,value){
    return sessionStorage.setItem(name,value);
}

export function getLocalStorage(name){
    return localStorage.getItem(name);
}

export function setLocalStorage(name,value){
    return localStorage.setItem(name,value);
}


export async function checkRefreshToken() {
    const refreshToken = getCookie('refreshToken');
    console.log(refreshToken);
    if (!refreshToken) {
        setUserIsAuth(false);
        console.log('Refresh token отсутствует. Пользователь не аутентифицирован.');
        return;
    }

    try {
        const response = await fetch('/api/refreshToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error('Ошибка обновления токена');
        }

        const data = await response.json();
        console.log(data);
        if (data.accessToken && data.refreshToken) {
            setAcessToken(data.accessToken);
            setRefreshToken(data.refreshToken, 7);
            setUserIsAuth(true);
            console.log('Пользователь авторизован с помощью refresh токена');
            syncLocalCartsWithServer(CART_STORAGE_KEY);
            syncLocalCartsWithServer(HEART_STORAGE_KEY);
        } else {
            throw new Error('Access токен или refresh токен не получен');
        }
    } catch (error) {
        console.error('Ошибка при обновлении токена:', error);
        setUserIsAuth(false);
        removeCookie('refreshToken');
    }
}
