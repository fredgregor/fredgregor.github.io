// Define the GraphQL endpoint and the signin endpoint
const GRAPHQL_ENDPOINT = "https://01.kood.tech/api/graphql-engine/v1/graphql";
const SIGNIN_ENDPOINT = "https://01.kood.tech/api/auth/signin";

// Function to handle user login
async function login(username, password) {
    const response = await fetch(SIGNIN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(`${username}:${password}`)
        }
    });

    if (!response.ok) {
        const error = await response.json();
        alert("Login failed: " + error.message);
        return null;
    }

    const data = await response.json();
    return data.jwt; // Return the JWT token
}

// Function to fetch user data using GraphQL
async function fetchUserData(jwt) {
    const query = `
        {
            user {
                id
                login
                email
                transactions {
                    amount
                    createdAt
                }
                progress {
                    grade
                    createdAt
                }
            }
        }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
        },
        body: JSON.stringify({ query })
    });

    if (!response.ok) {
        const error = await response.json();
        alert("Failed to fetch user data: " + error.message);
        return null;
    }

    const data = await response.json();
    return data.data.user; // Return the user data
}

// Function to display user data on the profile page
function displayUserData(user) {
    document.getElementById("username").textContent = user.login;
    document.getElementById("email").textContent = user.email;

    // Display total XP and transactions
    const totalXP = user.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    document.getElementById("total-xp").textContent = totalXP;

    // Display grades
    const gradesList = document.getElementById("grades-list");
    user.progress.forEach((grade) => {
        const li = document.createElement("li");
        li.textContent = `Grade: ${grade.grade}, Date: ${new Date(grade.createdAt).toLocaleDateString()}`;
        gradesList.appendChild(li);
    });
}

// Function to handle login form submission
async function handleLogin(event) {
    event.preventDefault(); // Prevent form submission

    const username = event.target.username.value;
    const password = event.target.password.value;

    const jwt = await login(username, password);
    if (jwt) {
        const user = await fetchUserData(jwt);
        if (user) {
            displayUserData(user);
        }
    }
}

// Attach event listener to the login form
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});