import { AddEventListenerAllInput, IsEmptyAllFilled, toggleValidationClass } from './module.js';

document.addEventListener('DOMContentLoaded', function () {
    const formInputs = document.querySelectorAll('.form_input input');
    const checkbox = document.getElementById('isPersonalData');
    const submitButton = document.querySelector('.form_button');

    AddEventListenerAllInput(formInputs, validateForm);
    checkbox.addEventListener('change', validateForm);

    // Функция для валидации всей формы
    function validateForm() {
        const allFilled = IsEmptyAllFilled(formInputs);
        const isCheckboxChecked = checkbox.checked;

        // Проверяем все условия для активации кнопки отправки формы
        let flag = (allFilled && isCheckboxChecked);
        submitButton.classList.toggle('disabled', !flag);

        // Логирование значений для отладки
        console.log({
            allFilled,
            isCheckboxChecked
        });
    }

    submitButton.addEventListener('click', function () {
        const nameInput = document.getElementById('reg_name');
        const lastnameInput = document.getElementById('reg_lastname');
        const emailInput = document.getElementById('reg_email');
        const phoneInput = document.getElementById('phone_number');

        const isNameValid = validateName(nameInput.value);
        const isLastNameValid = validateName(lastnameInput.value);
        const isEmailValid = validateEmail(emailInput.value);
        const isPhoneValid = validatePhone(phoneInput.value);

        // Логирование значений для отладки
        console.log({
            isNameValid,
            isLastNameValid,
            isEmailValid,
            isPhoneValid
        });

        if (isNameValid && isLastNameValid && isEmailValid && isPhoneValid) {
            let user = {
                firstName: nameInput.value,
                lastName: lastnameInput.value,
                password: '',
                phoneNumber: phoneInput.value,
                confirmPassword: '',
                email: emailInput.value,
                role: 'user'
            };

            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = 'registration2.html';
        } else {
            // Подсвечиваем поля, которые не прошли валидацию
            toggleValidationClass(nameInput, isNameValid);
            toggleValidationClass(lastnameInput, isLastNameValid);
            toggleValidationClass(emailInput, isEmailValid);
            toggleValidationClass(phoneInput, isPhoneValid);
        }
    });
});

// Функция для валидации имени и фамилии
function validateName(input) {
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ]{2,50}$/;
    return nameRegex.test(input);
}

// Функция для валидации адреса электронной почты
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Функция для валидации номера телефона
function validatePhone(phone) {
    const phoneRegex = /^(\+7|8)[\s]?\(?(\d{3})\)?[\s]?(\d{3})[-]?(\d{2})[-]?(\d{2})$/;
    return phoneRegex.test(phone);
}