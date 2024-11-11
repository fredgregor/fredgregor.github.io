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
                   time: { unit: 'day' }, 
                   title: { display: true, text: 'Date' } 
               },
               y: { 
                   title:{ display:true,text:'Cumulative XP' }, 
                   beginAtZero:true 
               }
           },
           plugins:{
               tooltip:{
                   callbacks:{
                       label:function(context){
                           return `${context.raw.label}: ${context.raw.y} XP`;
                       }
                   }
               }
           }
       }
   });

   // Display total XP
   const totalXP = cumulativeData[cumulativeData.length - 1].y;
   const xpInfoDiv= document.getElementById('xp-info');
   xpInfoDiv.innerHTML= `<h3>Total XP:${totalXP}</h3>`;
}