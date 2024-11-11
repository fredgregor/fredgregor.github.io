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