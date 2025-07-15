document.addEventListener('DOMContentLoaded', function () {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log(user.email);
        document.getElementById('vhod_email').value = user.email;
    }
});