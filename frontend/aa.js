// Mock database of users
let users = [
    {
        id: 'user1',
        username: 'CurrentUser', 
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Current',
        lastName: 'User',
        birthdate: new Date('1990-01-15'),
        gender: 'male'
    },
    {
        id: 'user2',
        username: 'JaneDoe',
        email: 'jane@example.com',
        password: 'jane123',
        firstName: 'Jane',
        lastName: 'Doe',
        birthdate: new Date('1992-05-20'),
        gender: 'female'
    },
    {
        id: 'user3',
        username: 'JohnSmith',
        email: 'john@example.com',
        password: 'john123',
        firstName: 'John',
        lastName: 'Smith',
        birthdate: new Date('1985-11-08'),
        gender: 'male'
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    populateBirthdayOptions();
    
    // Add event listener for Enter key on login form
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });
    
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });
    
    // Check for stored login info
    checkRememberedUser();
});

// Populate birthday dropdown options
function populateBirthdayOptions() {
    // Populate days
    const daySelect = document.getElementById('birth-day');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }
    
    // Populate years (120 years back from current year)
    const yearSelect = document.getElementById('birth-year');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 120; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

// Show signup modal
function showSignup() {
    document.getElementById('signup-modal').style.display = 'block';
}

// Close signup modal
function closeSignup() {
    document.getElementById('signup-modal').style.display = 'none';
}

// Show error modal
function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').style.display = 'block';
}

// Close error modal
function closeErrorModal() {
    document.getElementById('error-modal').style.display = 'none';
}

// Check for remembered user
function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const rememberedPass = localStorage.getItem('rememberedPass');
    
    if (rememberedUser && rememberedPass) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('password').value = rememberedPass;
        document.getElementById('remember-me').checked = true;
    }
}

// Login function
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    if (!username || !password) {
        showError('Please enter both username and password.');
        return;
    }
    
    // Check if the user exists
    const user = users.find(user => 
        (user.username.toLowerCase() === username.toLowerCase() || 
         user.email.toLowerCase() === username.toLowerCase()) && 
        user.password === password
    );
    
    if (user) {
        // Handle "Remember me" option
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
            localStorage.setItem('rememberedPass', password);
        } else {
            localStorage.removeItem('rememberedUser');
            localStorage.removeItem('rememberedPass');
        }
        
        // Store current user info in session storage
        sessionStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        }));
        
        // Redirect to homepage
        window.location.href = 'homepage.html';
    } else {
        showError('Invalid username or password.');
    }
}

// Create new account
function createAccount() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    
    // Get selected birth date
    const birthMonth = document.getElementById('birth-month').value;
    const birthDay = document.getElementById('birth-day').value;
    const birthYear = document.getElementById('birth-year').value;
    
    // Get selected gender
    let gender = '';
    const genderOptions = document.querySelectorAll('input[name="gender"]');
    for (const option of genderOptions) {
        if (option.checked) {
            gender = option.value;
            break;
        }
    }
    
    // Validate form
    if (!firstName || !lastName) {
        showError('Please enter your name.');
        return;
    }
    
    if (!email) {
        showError('Please enter your email or phone number.');
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
    
    // Check if email is already registered
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        showError('This email is already registered.');
        return;
    }
    
    // Create username based on name
    const username = (firstName + lastName).replace(/\s/g, '') + Math.floor(Math.random() * 1000);
    
    // Create new user
    const newUser = {
        id: 'user' + (users.length + 1),
        username: username,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        birthdate: new Date(birthYear, birthMonth - 1, birthDay),
        gender: gender
    };
    
    // Add to database
    users.push(newUser);
    
    // Store current user info in session storage
    sessionStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName
    }));
    
    // Show success and redirect
    alert('Account created successfully! Welcome to Linkster.');
    window.location.href = 'homepage.html';
}

// Close modal when clicking outside
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