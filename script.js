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
        console.log("Full response data:", JSON.stringify(data, null, 2));

        let token = data.token || data.access_token || data.jwt;
        if (typeof data === 'string' && data.startsWith('ey')) {
            token = data;
        } else if (data.data && data.data.token) {
            token = data.data.token;
        }

        if (token) {
            jwtToken = token;
            console.log("JWT Token found:", jwtToken);
            loginPage.classList.add('hidden');
            mainPage.classList.remove('hidden');
            showLoginConfirmation("Login successful!");
            await fetchUserData();
            await fetchXPData();
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

logoutButton.addEventListener('click', () => {
    jwtToken = '';
    mainPage.classList.add('hidden');
    loginPage.classList.remove('hidden');

    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    showLogoutConfirmation("You have been logged out successfully.");
});

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

async function fetchUserData() {
    try {
        if (!jwtToken) {
            console.error("No JWT token available");
            return;
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
                            email
                            auditRatio
                            totalUp
                            totalDown
                            campus
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

        if (result.data && result.data.user && result.data.user[0]) {
            displayUserData(result.data.user[0]);
        } else {
            console.error("Unexpected response structure:", result);
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

function displayUserData(user) {
    userInfoDiv.innerHTML = `
        <h2>User Profile</h2>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Login:</strong> ${user.login}</p>
        <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Campus:</strong> ${user.campus}</p>
        <p><strong>Audit Ratio:</strong> ${user.auditRatio.toFixed(2)}</p>
        <p><strong>Total XP Up:</strong> ${user.totalUp}</p>
        <p><strong>Total XP Down:</strong> ${user.totalDown}</p>
    `;

    createXPPieChart(user.totalUp, user.totalDown);
}

function createXPPieChart(totalUp, totalDown) {
    const total = totalUp + totalDown;
    const upPercentage = (totalUp / total) * 100;
    const downPercentage = (totalDown / total) * 100;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "200");
    svg.setAttribute("height", "200");
    svg.setAttribute("viewBox", "0 0 100 100");

    const upSlice = document.createElementNS(svgNS, "path");
    upSlice.setAttribute("d", `M50,50 L50,0 A50,50 0 ${upPercentage > 50 ? 1 : 0},1 ${50 + 50 * Math.sin(upPercentage * 0.02 * Math.PI)},${50 - 50 * Math.cos(upPercentage * 0.02 * Math.PI)} Z`);
    upSlice.setAttribute("fill", "#4CAF50");

    const downSlice = document.createElementNS(svgNS, "path");
    downSlice.setAttribute("d", `M50,50 L${50 + 50 * Math.sin(upPercentage * 0.02 * Math.PI)},${50 - 50 * Math.cos(upPercentage * 0.02 * Math.PI)} A50,50 0 ${downPercentage > 50 ? 1 : 0},1 50,0 Z`);
    downSlice.setAttribute("fill", "#F44336");

    svg.appendChild(upSlice);
    svg.appendChild(downSlice);

    const legend = document.createElement("div");
    legend.innerHTML = `
        <div><span style="color: #4CAF50;">■</span> XP Up: ${upPercentage.toFixed(1)}%</div>
        <div><span style="color: #F44336;">■</span> XP Down: ${downPercentage.toFixed(1)}%</div>
    `;

    const container = document.getElementById("xp-chart-container");
    container.innerHTML = "";
    container.appendChild(svg);
    container.appendChild(legend);
}

async function fetchXPData() {
    try {
        if (!jwtToken) {
            console.error("No JWT token available");
            return;
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
                        transaction(
                            where: {
                                _and: [
                                    {path: {_like: "/johvi/div-01/%"}},
                                    {type: {_eq: "xp"}},
                                    {path: {_nlike: "/johvi/div-01/piscine-js%"}}
                                ]
                            },
                            order_by: {createdAt: asc}
                        ) {
                            amount
                            createdAt
                            path
                        }
                    }
                `
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("XP data:", result);

        if (result.data && result.data.transaction) {
            createXPLineChart(result.data.transaction);
        } else {
            console.error("Unexpected response structure:", result);
        }
    } catch (error) {
        console.error("Error fetching XP data:", error);
    }
}

function createXPLineChart(transactions) {
    const ctx = document.getElementById('xpLineChart').getContext('2d');

    // Process data for the chart
    const chartData = transactions.map(t => ({
        x: new Date(t.createdAt),
        y: t.amount,
        label: t.path.split('/').pop() // Get the last part of the path
    }));

    // Calculate cumulative XP
    let cumulativeXP = 0;
    const cumulativeData = chartData.map(d => {
        cumulativeXP += d.y;
        return { x: d.x, y: cumulativeXP, label: d.label };
    });

    // Create the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Cumulative XP',
                data: cumulativeData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative XP'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw.label}: ${context.raw.y} XP`;
                        }
                    }
                }
            }
        }
    });

    // Display total XP
    const totalXP = cumulativeData[cumulativeData.length - 1].y;
    const xpInfoDiv = document.getElementById('xp-info');
    xpInfoDiv.innerHTML = `<h3>Total XP: ${totalXP}</h3>`;
}