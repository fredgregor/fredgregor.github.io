const loginForm = document.getElementById('login-form');
const userInfoDiv = document.getElementById('user-info');
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const logoutButton = document.getElementById('logout-button');
const loginError = document.getElementById('login-error');

let jwtToken = '';

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
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        jwtToken = data.token; // Assuming the token is in the response

        loginPage.classList.add('hidden');
        mainPage.classList.remove('hidden');

         // Show login confirmation message
         showLoginConfirmation("Login successful!");
         
        fetchUserData();
        
    } catch (error) {
        loginError.textContent = error.message;
    }
});

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
        const response = await fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
                    query {
                        userProfile { 
                            id 
                            username 
                            xp 
                            grades 
                            audits 
                            skills 
                        }
                    }
                `
            })
        });

        const result = await response.json();
        displayUserData(result.data.userProfile);
        
    } catch (error) {
        console.error(error);
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