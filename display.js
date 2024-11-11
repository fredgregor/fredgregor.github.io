function displayUserData(user) {
    userInfoDiv.innerHTML = `
        <h2>User Information</h2>
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

function createXPLineChartSVG(transactions) {
    const svgNS = "http://www.w3.org/2000/svg";
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const svgWidth = 800;
    const svgHeight = 400;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", svgHeight);
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Calculate scales
    const xScale = (date) => {
        const minDate = new Date(transactions[0].createdAt);
        const maxDate = new Date(transactions[transactions.length - 1].createdAt);
        return ((date - minDate) / (maxDate - minDate)) * width;
    };
    const yScale = (amount) => height - (amount / Math.max(...transactions.map(t => t.amount))) * height;

    // Create x-axis
    const xAxis = document.createElementNS(svgNS, "line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", height);
    xAxis.setAttribute("x2", width);
    xAxis.setAttribute("y2", height);
    xAxis.setAttribute("stroke", "black");
    g.appendChild(xAxis);

    // Create y-axis
    const yAxis = document.createElementNS(svgNS, "line");
    yAxis.setAttribute("x1", 0);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", 0);
    yAxis.setAttribute("y2", height);
    yAxis.setAttribute("stroke", "black");
    g.appendChild(yAxis);

    // Create y-axis ticks and labels
    const yTicks = 8; // Number of ticks on y-axis
    for (let i = 0; i <= yTicks; i++) {
        const y = (i / yTicks) * height;
        const xpAmount = Math.round((1 - i / yTicks) * Math.max(...transactions.map(t => t.amount)));

        // Create tick
        const tick = document.createElementNS(svgNS, "line");
        tick.setAttribute("x1", -5);
        tick.setAttribute("y1", y);
        tick.setAttribute("x2", 0);
        tick.setAttribute("y2", y);
        tick.setAttribute("stroke", "black");
        g.appendChild(tick);

        // Create label
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", -10);
        label.setAttribute("y", y);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute("font-size", "10");
        label.textContent = xpAmount;
        g.appendChild(label);
    }

    // Create line path
    const linePath = transactions.map((t, index) => 
        `${index === 0 ? 'M' : 'L'} ${xScale(new Date(t.createdAt))} ${yScale(t.amount)}`
    ).join(' ');

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", linePath);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#4CAF50");
    path.setAttribute("stroke-width", "2");
    g.appendChild(path);

    // Add data points and project name labels
    transactions.forEach((t, index) => {
        const x = xScale(new Date(t.createdAt));
        const y = yScale(t.amount);

        // Data point
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "3");
        circle.setAttribute("fill", "#4CAF50");
        g.appendChild(circle);

        // Project name label
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y - 10);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "8");
        text.textContent = t.path.split('/').pop();
        g.appendChild(text);

        // Date label
        const dateText = document.createElementNS(svgNS, "text");
        dateText.setAttribute("x", x);
        dateText.setAttribute("y", height + 20);
        dateText.setAttribute("text-anchor", "middle");
        dateText.setAttribute("font-size", "8");
        dateText.textContent = new Date(t.createdAt).toLocaleDateString();
        g.appendChild(dateText);
    });

   // Title for the chart
   const titleText = document.createElementNS(svgNS, "text");
   titleText.setAttribute("x", width / 2); // Centered horizontally
   titleText.setAttribute("y", -10); // Positioned above the chart area
   titleText.setAttribute("text-anchor", "middle"); 
   titleText.setAttribute("font-size", "16"); 
   titleText.textContent = "XP per Project"; 
   g.appendChild(titleText); 

   // X-axis label
   const xLabel = document.createElementNS(svgNS, "text");
   xLabel.setAttribute("x", width / 2);
   xLabel.setAttribute("y", height + 50);
   xLabel.setAttribute("text-anchor", "middle");
   xLabel.textContent = "Date";
   g.appendChild(xLabel);

   // Y-axis label
   const yLabel = document.createElementNS(svgNS, "text");
   yLabel.setAttribute("transform", `rotate(-90) translate(${-height/2}, ${-margin.left + 20})`);
   yLabel.setAttribute("text-anchor", "middle");
   yLabel.textContent = "XP Amount";
   g.appendChild(yLabel);

   const container = document.getElementById("xp-line-chart-container");
   container.innerHTML = "";
   container.appendChild(svg);
}