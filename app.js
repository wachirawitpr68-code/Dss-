let rawData = [];
let revenueChartInstance = null;
let clusterChartInstance = null;
let visitorChartInstance = null;

// Fetch data and initialize
async function initDashboard() {
    try {
        const response = await fetch('data.json');
        rawData = await response.json();
        updateDashboard();
    } catch (error) {
        console.error("Error loading data:", error);
        alert("กรุณาเปิดไฟล์ผ่าน Live Server หรือ Web Server เพื่อให้โหลด data.json ได้ครับ");
    }
}

// Event Listeners for OLAP Filters (Slice & Dice)
document.getElementById('filterFestival').addEventListener('change', updateDashboard);
document.getElementById('filterStyle').addEventListener('change', updateDashboard);
// Event Listener for the new Score Filter
document.getElementById('filterScore').addEventListener('change', updateDashboard);

function updateDashboard() {
    // 1. Get filter values (OLAP: Slice & Dice)
    const festivalFilter = document.getElementById('filterFestival').value;
    const styleFilter = document.getElementById('filterStyle').value;
    const scoreFilter = document.getElementById('filterScore').value;

    // 2. Filter data
    let filteredData = rawData.filter(row => {
        let passFestival = festivalFilter === 'all' ? true : row.isFestival.toString() === festivalFilter;
        let passStyle = styleFilter === 'all' ? true : row.travelStyle === styleFilter;
        
        let passScore = true;
        if (scoreFilter === 'high') passScore = row.satisfaction >= 4.0;
        else if (scoreFilter === 'med') passScore = row.satisfaction >= 3.0 && row.satisfaction < 4.0;
        else if (scoreFilter === 'low') passScore = row.satisfaction < 3.0;

        return passFestival && passStyle && passScore;
    });

    // 3. Update KPIs
    updateKPIs(filteredData);

    // 4. Update Charts
    drawVisitorChart(filteredData);
    drawRevenueChart(filteredData);
    drawClusterChart(filteredData);

    // 5. Render Reviews (Top 5)
    renderReviews(filteredData);
}

function updateKPIs(data) {
    if (data.length === 0) {
        document.getElementById('kpiRevenue').innerText = "0 ฿";
        document.getElementById('kpiVisitors').innerText = "0 คน";
        document.getElementById('kpiArpu').innerText = "0 ฿";
        document.getElementById('kpiSatisfaction').innerText = "0.0 / 5";
        return;
    }

    const totalRev = data.reduce((sum, row) => sum + row.revenue, 0);
    const totalVis = data.reduce((sum, row) => sum + row.visitors, 0);
    const avgSat = data.reduce((sum, row) => sum + row.satisfaction, 0) / data.length;
    const arpu = totalVis > 0 ? totalRev / totalVis : 0;

    document.getElementById('kpiRevenue').innerText = totalRev.toLocaleString() + " ฿";
    document.getElementById('kpiVisitors').innerText = totalVis.toLocaleString() + " คน";
    document.getElementById('kpiArpu').innerText = arpu.toLocaleString(undefined, {maximumFractionDigits:0}) + " ฿";
    document.getElementById('kpiSatisfaction').innerText = avgSat.toFixed(1) + " / 5";
}

function drawVisitorChart(data) {
    const ctx = document.getElementById('visitorChart').getContext('2d');
    const monthsOrder = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    const visitorsByMonth = {};
    monthsOrder.forEach(m => visitorsByMonth[m] = 0);

    data.forEach(row => {
        if(visitorsByMonth[row.month] !== undefined) {
            visitorsByMonth[row.month] += row.visitors;
        }
    });

    const labels = monthsOrder;
    const values = labels.map(m => visitorsByMonth[m]);

    if (visitorChartInstance) visitorChartInstance.destroy();

    visitorChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนนักท่องเที่ยว (คน)',
                data: values,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function drawRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const revenueByLocation = {};
    data.forEach(row => {
        revenueByLocation[row.location] = (revenueByLocation[row.location] || 0) + row.revenue;
    });

    const labels = Object.keys(revenueByLocation);
    const values = Object.values(revenueByLocation);

    if (revenueChartInstance) revenueChartInstance.destroy();

    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'รายได้ชุมชน (บาท)',
                data: values,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function drawClusterChart(data) {
    const ctx = document.getElementById('clusterChart').getContext('2d');
    const clusterColors = {
        "Family Chill-Out": "rgba(34, 197, 94, 0.7)",
        "Solo Explorer": "rgba(234, 179, 8, 0.7)",
        "Festival Spenders": "rgba(239, 68, 68, 0.7)"
    };

    const datasets = [];
    const clusters = [...new Set(data.map(d => d.cluster))];

    clusters.forEach(clusterName => {
        const clusterPoints = data.filter(d => d.cluster === clusterName).map(d => ({
            x: d.satisfaction,
            y: d.revenue,
            location: d.location
        }));

        datasets.push({
            label: clusterName,
            data: clusterPoints,
            backgroundColor: clusterColors[clusterName] || 'rgba(156, 163, 175, 0.7)',
            pointRadius: 8,
            pointHoverRadius: 10
        });
    });

    if (clusterChartInstance) clusterChartInstance.destroy();

    clusterChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'คะแนนความพึงพอใจ (1-5)' }, min: 1, max: 5 },
                y: { title: { display: true, text: 'รายได้ (บาท)' }, beginAtZero: true }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const point = ctx.raw;
                            return `พอใจ: ${point.x}, รายได้: ${point.y}฿ (${point.location})`;
                        }
                    }
                }
            }
        }
    });
}

function renderReviews(data) {
    const container = document.getElementById('reviewContainer');
    container.innerHTML = '';
    
    // ดึงมาแสดงแค่ 5 รายการแรก (Top 5)
    const top5 = data.slice(0, 5);
    
    if(top5.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 italic p-4 bg-gray-50 rounded">ไม่มีข้อมูลรีวิวที่ตรงกับเงื่อนไขที่เลือก</p>';
        return;
    }

    top5.forEach(row => {
        // จัดการเรื่องสีตามเกณฑ์คะแนนดาว
        let borderColor = 'border-gray-300';
        let starColor = 'text-gray-500';
        
        if (row.satisfaction >= 4.0) {
            borderColor = 'border-green-500';
            starColor = 'text-green-600';
        } else if (row.satisfaction >= 3.0) {
            borderColor = 'border-yellow-500';
            starColor = 'text-yellow-600';
        } else {
            borderColor = 'border-red-500';
            starColor = 'text-red-600';
        }
        
        const div = document.createElement('div');
        div.className = `p-4 bg-gray-50 rounded-lg border-l-4 ${borderColor} flex justify-between items-start gap-4 transition-all hover:bg-gray-100`;
        div.innerHTML = `
            <div>
                <p class="text-sm font-semibold text-gray-800">${row.location} 
                    <span class="text-xs text-gray-500 font-normal ml-2 bg-gray-200 px-2 py-1 rounded-full">${row.travelStyle} | ${row.month}</span>
                </p>
                <p class="text-sm text-gray-700 mt-2 italic">"${row.review}"</p>
            </div>
            <div class="text-right whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                <span class="font-bold ${starColor}">⭐ ${row.satisfaction.toFixed(1)}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// Start app
initDashboard();
