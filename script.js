let jwtToken = '';
const loginForm = document.getElementById('login-form');
const userInfoDiv = document.getElementById('user-info');
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const logoutButton = document.getElementById('logout-button');
const loginError = document.getElementById('login-error');
const encodedToken = "your-encoded-token-here";
fetchUserData(encodedToken);

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // We're not using base64URLEncode anymore, just use btoa for Basic Auth
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
        console.log("Full response data:", JSON.stringify(data, null, 2));

        // Check for token in different possible locations
        let token = data.token || data.access_token || data.jwt;
        if (typeof data === 'string' && data.startsWith('ey')) {
            // If the entire response is the token
            token = data;
        } else if (data.data && data.data.token) {
            // If token is nested in a 'data' object
            token = data.data.token;
        }

        if (token) {
            jwtToken = token;
            console.log("JWT Token found:", jwtToken);
            loginPage.classList.add('hidden');
            mainPage.classList.remove('hidden');
            showLoginConfirmation("Login successful!");
            await fetchUserData(); // Make sure to await this
        } else {
            throw new Error('Token not found in response');
        }
    } catch (error) {
        console.error("Login error:", error);
        loginError.textContent = error.message;
    }
});

function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showLoginConfirmation(message) {
    // Create a div for the confirmation message
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'logout-confirmation'; // Use the same class name for styling
    confirmationDiv.textContent = message;

    // Append the message to the body
    document.body.appendChild(confirmationDiv);

    // Set a timer to remove the message after 3 seconds
    setTimeout(() => {
        confirmationDiv.style.opacity = 0; // Fade out effect
        setTimeout(() => {
            confirmationDiv.remove(); // Remove from DOM after fade out
        }, 500); // Wait for fade out to complete
    }, 3000); // Display for 3 seconds
}

logoutButton.addEventListener('click', () => {
    jwtToken = '';
    mainPage.classList.add('hidden');
    loginPage.classList.remove('hidden');

    // Clear the input fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
     // Show logout confirmation message
     showLogoutConfirmation("You have been logged out successfully.");
});

function showLogoutConfirmation(message) {
    // Create a div for the confirmation message
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'logout-confirmation';
    confirmationDiv.textContent = message;

    // Append the message to the body
    document.body.appendChild(confirmationDiv);

    // Set a timer to remove the message after 3 seconds
    setTimeout(() => {
        confirmationDiv.style.opacity = 0; // Fade out effect
        setTimeout(() => {
            confirmationDiv.remove(); // Remove from DOM after fade out
        }, 500); // Wait for fade out to complete
    }, 3000); // Display for 3 seconds
}

async function fetchUserData() {
    try {
        if (!jwtToken) {
            console.error("No JWT token available");
            return; // Exit the function if no token is available
        }

        const response = await fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
                    query {
                        user {
                            id
                            login
                            firstName
                            lastName
                        }
                    }
                `
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("User data:", result);

        if (result.data && result.data.user) {
            displayUserData(result.data.user);
        } else {
            console.error("Unexpected response structure:", result);
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

function displayUserData(user) {
    userInfoDiv.innerHTML = `
        <p>ID: ${user.id}</p>
        <p>Username: ${user.username}</p>
        <p>XP Amount: ${user.xp}</p>
        <p>Grades: ${user.grades.join(', ')}</p>
        <p>Audits: ${user.audits.join(', ')}</p>
        <p>Skills: ${user.skills.join(', ')}</p>
    `;
}