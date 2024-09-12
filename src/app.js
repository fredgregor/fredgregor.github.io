// Function to fetch data using GraphQL
async function fetchQuery(query) {
    const url = "https://01.kood.tech/api/graphql-engine/v1/graphql";
    const token = localStorage.getItem("jwt");

    if (!token) {
        throw new Error("JWT token not found in localStorage");
    }

    const config = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.error || `Error: ${response.status} ${response.statusText}`
            );
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch query failed:", error);
        throw error; // Rethrow the error after logging it
    }
}

// Asynchronous function to handle user login
async function login(usernameOrEmail, pw) {
    const credentials = `${usernameOrEmail}:${pw}`;
    const encodedCredentials = btoa(credentials);
    const response = await fetch("https://01.kood.tech/api/auth/signin", {
        method: "POST",
        headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Unknown error occurred in authentication.js");
    }

    const data = await response.json();
    console.log(data);
    const jwt = data;
    localStorage.setItem("jwt", jwt);
    return jwt;
}

// Async function that checks if a session exists and automatically logs in if the session hasn't expired
async function ifSessionExistLogIn() {
    if (localStorage.getItem("jwt") || localStorage.getItem("hasura-jwt-token")) {
        getUserData();
    }
}

// Call the ifSessionExistLogin function immediately when localStorage has JWT Token already
ifSessionExistLogIn();

// Function to handle the login process
function loginPage() {
    const user = document.querySelector(".usernameOrEmail").value;
    const pw = document.querySelector(".password").value;

    login(user, pw)
        .then(() => {
            getUserData(); // Fetch user data after successful login
            document.querySelector(".usernameOrEmail").value = "";
            document.querySelector(".password").value = "";
        })
        .catch((error) => {
            console.log(error);
            document.querySelector(".errorMsg").textContent = error.message;
        });
}

function transformSkillTypes(dataArray) {
    const skillMap = {
        go: "GoLang",
        js: "Javascript",
        html: "Html",
        css: "Css",
        docker: "Docker",
        algo: "Algorithms",
        "front-end": "Frontend",
        "back-end": "Backend",
        stats: "Statistics",
        game: "Game",
    };

    return dataArray.map((obj) => {
        const formatted = obj.type.slice(6); // Remove the "skill_" prefix
        return {
            ...obj,
            type: skillMap[formatted] || formatted, // Replace with the mapped value or keep original
        };
    });
}

// Function to get user data
function getUserData() {
    displayMainPage();

    let functions = [displayProfile, displayXps, displayLevel, displayTopSkills];
    functions.forEach((func) => {
        func().catch((err) => {
            console.error(`function ${func.name}: ${err.message}`);
        });
    });
}

// Function to display the main page and hide the login page
function displayMainPage() {
    const loginPage = document.querySelector(".loginPage");
    const mainPage = document.getElementById("main-container"); // Updated to use ID

    if (loginPage && mainPage) {
        loginPage.style.display = "none";
        mainPage.style.display = "block";
    } else {
        console.error("Error: .loginPage or #main-container element not found.");
    }
}

// Function to display user profile
async function displayProfile() {
    let userObject = `{
        user {
            login
            attrs
            id
            auditRatio
            totalUp
            totalDown
        }
    }`;

    const qry = await fetchQuery(userObject);
    const userData = qry.data.user[0];
    const attrs = userData.attrs;
    const login = userData.login;

    const {
        email,
        tel,
        lastName,
        firstName,
        personalIdentificationCode,
        addressStreet,
        addressCity,
        addressCountry,
    } = attrs;

    document.getElementById("navBarWelcomeName").innerHTML = `Welcome ${firstName} ${lastName}!`;

    document.getElementById("userData").innerHTML = `
        <div class="boxData">${login}</div>
        <div class="boxData">${personalIdentificationCode}</div>
        <div class="boxData">${email}</div>
        <div class="boxData">${tel}</div>
        <div class="boxData">${addressStreet}, ${addressCity}, ${addressCountry}</div>
    `;

    const auditRatio = userData.auditRatio.toFixed(1);
    const totalUp = (userData.totalUp / 1000000).toFixed(2);
    const totalDown = (userData.totalDown / 1000000).toFixed(2);
    const totalBar = userData.totalUp + userData.totalDown;
    const totalUpPercentage = (userData.totalUp / totalBar) * 100;
    const totalDownPercentage = 100 - totalUpPercentage;

    document.getElementById("auditRatio").innerHTML = `
        <div class="auditDiv">
            <div class="auditTitle">Audit Ratio</div>
            <div class="auditRatio">${auditRatio}</div>
        </div>
        <div class="barContainer">
            <div class="bar barUp" style="width: ${totalUpPercentage}%;">${totalUpPercentage.toFixed(2)}%</div>
            <div class="bar barDown" style="width: ${totalDownPercentage}%;">${totalDownPercentage.toFixed(2)}%</div>
        </div>
        <div class="auditLastRow">
            <div class="auditData upCls">↑Done ${totalUp} MB</div>
            <div class="auditData downCls">↓Received ${totalDown} MB</div>
        </div>`;
}

// Function to display XPs
async function displayXps() {
    let xpsData = `{
        transaction(where: {type: {_eq:"xp"}, object: {type: {_eq:"project"}}}) {
            amount
            object {
                name
            }
        }
    }`;

    const data = await fetchQuery(xpsData);
    const xpData = data.data.transaction.map((item) => ({
        name: item.object.name,
        amount: (item.amount / 1000).toFixed(0), // Convert amount to kilobytes
    }));

    xpData.sort((a, b) => b.amount - a.amount);
    displayXpChart(xpData); // Call the display function from charts.js
}

// Function to display user level
async function displayLevel() {
    const userIdQuery = `
        {
            user {
                id
            }
        }
    `;

    try {
        const userIdResponse = await fetchQuery(userIdQuery);
        const users = userIdResponse.data.user;

        if (users.length === 0) {
            return;
        }
        const userId = users[0].id;

        const userLevelQuery = `
            {
                transaction(
                    where: {
                        userId: {_eq: ${userId}}, 
                        type: {_eq: "level"}, 
                        object: {type: {_regex: "project"}}
                    },
                    order_by: {amount: desc},
                    limit: 1
                ) {
                    amount
                }
            }
        `;

        const userLevelResponse = await fetchQuery(userLevelQuery);
        const userLevelTransaction = userLevelResponse.data.transaction;

        if (userLevelTransaction.length === 0) {
            return;
        }

        const userLevel = userLevelTransaction[0].amount;

        const xpsData = `
            {
                transaction(where: {type: {_eq:"xp"}, object: {type: {_eq:"project"}}}) {
                    amount
                    object {
                        name
                    }
                }
            }
        `;

        const data = await fetchQuery(xpsData);
        const xpData = data.data.transaction.map((item) => ({
            name: item.object.name,
            amount: (item.amount / 1000).toFixed(0), // Convert amount to kilobytes
        }));

        let totalXpGained = 0;
        xpData.forEach((item) => {
            const xpAmount = Number(item.amount);
            totalXpGained += xpAmount >= 1000 ? xpAmount / 1000 : xpAmount;
        });

        const xpAndLevelDiv = document.getElementById("xpAndLevel");
        if (xpAndLevelDiv) {
            xpAndLevelDiv.innerHTML = `
                <div class="boxDataCenter">
                    <div class="label">Total XP</div>
                    <div class="value">${totalXpGained >= 1000 ? (totalXpGained.toFixed(1) / 1000) + ' MB' : totalXpGained + ' Kb'}</div>
                </div>
                <div class="boxDataCenter">
                    <div class="label">Rank</div>
                    <div class="value">${getRank(userLevel)} Developer</div>
                </div>
                <div class="boxDataCenter">
                    <div class="label">Level</div>
                    <div class="value">${userLevel}</div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to display top skills
async function displayTopSkills() {
    let topSkillsQuery = `
        {  
            transaction(
                where: {type: {_ilike: "%skill%"}},
                order_by: {amount: desc}
            ) {
                type
                amount
            }
        }`;

    const data = await fetchQuery(topSkillsQuery);
    createPieChart(transformSkillTypes(cleanData)); // Call the createPieChart function from charts.js
}

// Function to display the main page and hide the login page
function displayMainPage() {
    const loginPage = document.querySelector(".loginPage");
    const mainPage = document.getElementById("main-container"); // Updated to use ID

    if (loginPage && mainPage) {
        loginPage.style.display = "none";
        mainPage.style.display = "block";
    } else {
        console.error("Error: .loginPage or #main-container element not found.");
    }
}

// Function to log out the user
function logOut() {
    document.querySelector(".loginPage").style.display = "flex";
    document.querySelector("#main-container").style.display = "none"; // Use ID here
    document.querySelector(".errorMsg").textContent = "";
    localStorage.removeItem("jwt");
}

// Add an event listener to the login form to handle form submission
document.getElementById("login").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission behavior
    loginPage();
});