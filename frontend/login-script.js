// Initialize page

// Load birthday options and check remembered user on DOM load
document.addEventListener('DOMContentLoaded', () => {
    populateBirthdayOptions();

    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });

    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });

    checkRememberedUser();
});

function populateBirthdayOptions() {
    const daySelect = document.getElementById('birth-day');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }

    const yearSelect = document.getElementById('birth-year');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 120; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

function showSignup() {
    document.getElementById('signup-modal').style.display = 'block';
}

function closeSignup() {
    document.getElementById('signup-modal').style.display = 'none';
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').style.display = 'block';
}

function closeErrorModal() {
    document.getElementById('error-modal').style.display = 'none';
}

function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const rememberedPass = localStorage.getItem('rememberedPass');

    if (rememberedUser && rememberedPass) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('password').value = rememberedPass;
        document.getElementById('remember-me').checked = true;
    }
}

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    if (!username || !password) {
        showError('Please enter both username and password.');
        return;
    }

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            showError('Invalid username or password.');
            return;
        }

        const user = await response.json();

        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
            localStorage.setItem('rememberedPass', password);
        } else {
            localStorage.removeItem('rememberedUser');
            localStorage.removeItem('rememberedPass');
        }

        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'homepage.html';
    } catch (error) {
        console.error('Login failed', error);
        showError('Login failed due to a server error.');
    }
}

async function createAccount() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const username = document.getElementById('user-name').value.trim();
    const password = document.getElementById('signup-password').value;

    const birthMonth = document.getElementById('birth-month').value;
    const birthDay = document.getElementById('birth-day').value;
    const birthYear = document.getElementById('birth-year').value;

    let gender = '';
    const genderOptions = document.querySelectorAll('input[name="gender"]');
    for (const option of genderOptions) {
        if (option.checked) {
            gender = option.value;
            break;
        }
    }

    if (!firstName || !lastName) {
        showError('Please enter your name.');
        return;
    }

    if (!email) {
        showError('Please enter your email or phone number.');
        return;
    }

    if (!username) {
        showError('Please enter your username.');
        return;
    }

    if (!password || password.length < 6) {
        showError('Please enter a password with at least 6 characters.');
        return;
    }

    if (!birthMonth || !birthDay || !birthYear) {
        showError('Please enter your complete birthday.');
        return;
    }

    if (!gender) {
        showError('Please select a gender.');
        return;
    }

    const newUser = {
        first_name: firstName,
        last_name: lastName,
        user_name: username,
        email: email,
        password: password,
        birthdate: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`,
        gender: gender
    };

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (!response.ok) {
            showError('This username or email is already registered or invalid input.');
            return;
        }

        const createdUser = await response.json();

        sessionStorage.setItem('currentUser', JSON.stringify(createdUser));
        alert('Account created successfully! Welcome to Linkster.');
        window.location.href = 'homepage.html';

    } catch (error) {
        console.error('Registration failed', error);
        showError('Registration failed due to a server error.');
    }
}

window.onclick = function(event) {
    const signupModal = document.getElementById('signup-modal');
    const errorModal = document.getElementById('error-modal');

    if (event.target === signupModal) {
        closeSignup();
    }

    if (event.target === errorModal) {
        closeErrorModal();
    }
};
