let jwtToken = '';
const loginForm = document.getElementById('login-form');
const userInfoDiv = document.getElementById('user-info');
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const logoutButton = document.getElementById('logout-button');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const credentials = btoa(`${username}:${password}`);

    try {
        const response = await fetch('https://01.kood.tech/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        let token = data.token || data.access_token || data.jwt;
        if (typeof data === 'string' && data.startsWith('ey')) {
            token = data;
        } else if (data.data && data.data.token) {
            token = data.data.token;
        }

        if (token) {
            jwtToken = token; // Store the token for future requests
            loginPage.classList.add('hidden');
            mainPage.classList.remove('hidden');
            showLoginConfirmation("Login successful!");
            await fetchUserData(); // Fetch user data after successful login
            await fetchXPData(); // Fetch XP data after successful login
        } else {
            throw new Error('Token not found in response');
        }
    } catch (error) {
        console.error("Login error:", error);
        loginError.textContent = error.message;
    }
});

logoutButton.addEventListener('click', () => {
    jwtToken = ''; // Clear the token on logout
    mainPage.classList.add('hidden');
    loginPage.classList.remove('hidden');

    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    showLogoutConfirmation("You have been logged out successfully.");
});

function showLoginConfirmation(message) {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'logout-confirmation';
    confirmationDiv.textContent = message;

    document.body.appendChild(confirmationDiv);

    setTimeout(() => {
        confirmationDiv.style.opacity = 0;
        setTimeout(() => {
            confirmationDiv.remove();
        }, 500);
    }, 3000);
}

function showLogoutConfirmation(message) {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'logout-confirmation';
    confirmationDiv.textContent = message;

    document.body.appendChild(confirmationDiv);

    setTimeout(() => {
        confirmationDiv.style.opacity = 0;
        setTimeout(() => {
            confirmationDiv.remove();
        }, 500);
    }, 3000);
}