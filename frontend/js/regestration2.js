import { toggleValidationClass, Registration, IsValidAllInputs } from './module.js';

document.addEventListener('DOMContentLoaded', function () {

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log(user)
    
        IsValidAllInputs('.form_input input','.form_button');

        function validatePassword(password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
            return passwordRegex.test(password);
        }
        function validatePasswordRepeat(password, password_repeat){
            return password === password_repeat;
        }

        document.querySelector('.form_button').addEventListener('click', async function () {
            const password = document.getElementById('create_password');
            const password_repeat = document.getElementById('password_repeat');

            const isPasswordValid = validatePassword(password.value);
            const isPasswordRepeatValid = validatePasswordRepeat(password.value, password_repeat.value);

            console.log({
                isPasswordValid,
                isPasswordRepeatValid
            });

            if (isPasswordValid && isPasswordRepeatValid ) {
                user.password = password.value;
                user.confirmPassword = password_repeat.value;
                //запрос к бэку для регистрации пользователя
                // const userAdmin = {
                //     firstName:'Jack',
                //     lastName:'Collins',
                //     password:'Example123!',
                //     phoneNumber:'+79998887766',
                //     confirmPassword:'Example123!',
                //     email:'FurnitureStoreAdmin@gmail.com',
                //     role:'admin'
                // }
                Registration(user)
                    .then(sortedData => {
                        alert("Регистрация прошла успешно");
                        window.location.href = 'index.html';
                    })
                    .catch(error => {
                        if (error.message === 'user_exists') {
                            window.location.href = 'recoveryPassword.html';
                            alert("Пользователь с указанным email уже существует");
                        } else {
                            alert("Ошибка при регистрации! Повторите попытку позже");
                            console.log("Ошибка при регистрации");
                            window.location.href = 'index.html';
                        }
                        console.error('Error:', error.message);
                    });
                localStorage.removeItem('user');
            } else {
                toggleValidationClass(password, isPasswordValid);
                toggleValidationClass(password_repeat, isPasswordRepeatValid);
            }
        });
    } else {
        console.error('No user data found');
    }
});

// let admin = {
//     firstName: 'Admin',
//     lastName: 'FurnituteStore',
//     password: 'Admin123_',
//     phoneNumber: '+79998888888',
//     confirmPassword:'Admin123_',
//     email: 'FurnitureStoreAdmin@gmail.com',
//     role: 'admin'
// }