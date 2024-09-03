// Function to create a pie chart
function createPieChart(data) {
    const svg = document.getElementById("pieChart");
    const width = svg.getAttribute("width");
    const height = svg.getAttribute("height");
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2 + 80; // Lower the pie chart to make space for the legend above

    // Define colors and labels for legend
    const colorsArray = ["#d5e91e", "#a1b800", "#6e8900", "#415d00", "#273200"];

    // Calculate the total value to ensure slices sum to 100%
    const totalValue = data.reduce((sum, slice) => sum + slice.amount, 0);

    let cumulativeAngle = 0;

    data.forEach((slice, index) => {
        const sliceValue = slice.amount;
        const sliceAngle = (sliceValue / totalValue) * 2 * Math.PI;

        // Calculate slice's end position
        const x1 = centerX + radius * Math.cos(cumulativeAngle);
        const y1 = centerY + radius * Math.sin(cumulativeAngle);
        const x2 = centerX + radius * Math.cos(cumulativeAngle + sliceAngle);
        const y2 = centerY + radius * Math.sin(cumulativeAngle + sliceAngle);

        // Determine if the arc should be large or small
        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

        // Create path element for the slice
        const pathData = `
            M ${centerX} ${centerY} 
            L ${x1} ${y1} 
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} 
            Z`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", colorsArray[index % colorsArray.length]);

        // Append the slice to the SVG element
        svg.appendChild(path);

        // Calculate the position for the percentage label
        const midAngle = cumulativeAngle + sliceAngle / 2;
        const labelX = centerX + (radius / 2) * Math.cos(midAngle);
        const labelY = centerY + (radius / 2) * Math.sin(midAngle);
        const percentage = ((sliceValue / totalValue) * 100).toFixed(0) + "%";

        // Create text element for percentage
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", labelX);
        text.setAttribute("y", labelY);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "#fff"); // White color for better visibility
        text.textContent = percentage;

        svg.appendChild(text);

        // Update cumulative angle for the next slice
        cumulativeAngle += sliceAngle;
    });

    // Add legend above the pie chart
    const legendX = centerX;
    let legendY = 0; // Start position for the legend at the top
    data.forEach((slice, index) => {
        const legendColorBox = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );
        legendColorBox.setAttribute("x", legendX - 40);
        legendColorBox.setAttribute("y", legendY + 5);
        legendColorBox.setAttribute("width", 20);
        legendColorBox.setAttribute("height", 20);
        legendColorBox.setAttribute(
            "fill",
            colorsArray[index % colorsArray.length]
        );

        const legendText = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );
        legendText.setAttribute("x", legendX - 10);
        legendText.setAttribute("y", legendY + 20);
        legendText.setAttribute("fill", "#ffffff");
        legendText.textContent = slice.type;

        svg.appendChild(legendColorBox);
        svg.appendChild(legendText);

        legendY += 30; // Adjust vertical spacing between legend items
    });
}

// Function to display XP chart
function displayXpChart(xpData) {
    const chartContainer = document.getElementById("userXp");
    chartContainer.innerHTML = "";
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    const barWidth = 45; // Width of each bar
    const spaceBetweenChar = 25; // Space between bars
    const maxAmount = Math.max(...xpData.map((item) => item.amount));
    const chartHeight = 250; // Fixed height for the chart area
    svg.setAttribute("width", xpData.length * (barWidth + spaceBetweenChar));
    svg.setAttribute("height", 400); // Adjust height to include space for project names
    xpData.forEach((item, index) => {
        const barHeight = (item.amount / maxAmount) * chartHeight * 0.6; // Scale bar height to chart height
        const xPos = index * (barWidth + spaceBetweenChar);
        const yPos = chartHeight - barHeight; // Position bars from the top down
        const bar = document.createElementNS(svgNS, "rect");
        bar.setAttribute("x", xPos);
        bar.setAttribute("y", yPos);
        bar.setAttribute("width", barWidth);
        bar.setAttribute("height", barHeight);
        bar.style.fill = changeColorBasedOnKb(item.amount);
        const grayBar = document.createElementNS(svgNS, "rect");
        grayBar.setAttribute("x", xPos);
        grayBar.setAttribute("y", 0);
        grayBar.setAttribute("width", barWidth);
        grayBar.setAttribute("height", yPos); // Full bar height
        grayBar.style.fill = "rgb(106 115 73 / 55%)";
        const showXpAmount = document.createElementNS(svgNS, "text");
        showXpAmount.setAttribute("x", xPos + barWidth / 2);
        showXpAmount.setAttribute("y", yPos - 5); // Position text above the bar
        showXpAmount.setAttribute("text-anchor", "middle");
        showXpAmount.style.fill = changeColorBasedOnKb(item.amount);
        showXpAmount.textContent = `${item.amount} Kb`;
        const showProjectName = document.createElementNS(svgNS, "text");
        const nameX = xPos + barWidth / 2;
        const nameY = chartHeight; // Position text below the bars
        showProjectName.setAttribute("x", nameX + 10);
        showProjectName.setAttribute("y", chartHeight + 20); // Adjust the y-position as needed
        showProjectName.style.fill = changeColorBasedOnKb(item.amount);
        showProjectName.style.fontSize = "12px"; // Set font size
        showProjectName.textContent = item.name;
        showProjectName.setAttribute("class", "chart-text");
        showProjectName.setAttribute("transform", `rotate(45 ${nameX} ${nameY})`);
        svg.appendChild(bar);
        svg.appendChild(grayBar);
        svg.appendChild(showXpAmount);
        svg.appendChild(showProjectName);

        function changeColorBasedOnKb(xpAmount) {
            const startColor = [247, 205, 21]; // Light Yellow
            const endColor = [179, 216, 30]; // Dark green
            const ratio = Math.min(xpAmount / maxAmount, 1);
            const r = Math.round(
                startColor[0] + ratio * (endColor[0] - startColor[0])
            );
            const g = Math.round(
                startColor[1] + ratio * (endColor[1] - startColor[1])
            );
            const b = Math.round(
                startColor[2] + ratio * (endColor[2] - startColor[2])
            );
            return `rgb(${r},${g},${b})`;
        }
    });

    // Adding title to chart to the bottom right corner
    const chartTitle = document.createElementNS(svgNS, "text");
    chartTitle.setAttribute("x", svg.getAttribute("width") - 10);
    chartTitle.setAttribute("y", svg.getAttribute("height") - 10);
    chartTitle.setAttribute("text-anchor", "end");
    chartTitle.setAttribute("dominant-baseline", "baseline");
    chartTitle.style.fontSize = "20px";
    chartTitle.style.fill = "#d5e91e";
    chartTitle.textContent = "XP Gained by Projects";
    svg.appendChild(chartTitle);
    chartContainer.appendChild(svg);
}