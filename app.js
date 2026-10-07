let rawData = [];
let revenueChartInstance = null;
let clusterChartInstance = null;
let visitorChartInstance = null;

// Map Variables
let tourismMap = null;
let mapMarkersGroup = null;

// Location Meta Data (Virtual Dimension Table for Map mapping)
// Image Sources are real Wikimedia Commons images.
const locationDictionary = {
    "ลานพญาศรีสัตตนาคราช": {
        lat: 17.3995, lng: 104.7937,
        type: "แลนด์มาร์ก / จุดเช็คอิน", district: "เมืองนครพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Phaya_Si_Sattanakharat.jpg/800px-Phaya_Si_Sattanakharat.jpg",
        source: "Wikimedia Commons"
    },
    "วัดพระธาตุพนม": {
        lat: 16.9416, lng: 104.7231,
        type: "ศาสนสถานสำคัญ", district: "ธาตุพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Wat_Phra_That_Phanom2.jpg/800px-Wat_Phra_That_Phanom2.jpg",
        source: "Wikimedia Commons"
    },
    "ถนนคนเดินนครพนม": {
        lat: 17.4068, lng: 104.7891, // หอนาฬิกาเวียดนามอนุสรณ์ (ศูนย์กลางถนนคนเดิน)
        type: "แหล่งช้อปปิ้ง / ตลาด", district: "เมืองนครพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Nakhon_Phanom_Clock_Tower.jpg/800px-Nakhon_Phanom_Clock_Tower.jpg",
        source: "Wikimedia Commons"
    },
    "ชุมชนไทญ้อ": {
        lat: 17.0544, lng: 104.6783, // บริเวณวัดพระธาตุเรณู (ศูนย์กลางวัฒนธรรมเรณูนคร)
        type: "ชุมชนวัฒนธรรม", district: "เรณูนคร",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Phra_That_Renu_Nakhon.jpg/800px-Phra_That_Renu_Nakhon.jpg",
        source: "Wikimedia Commons"
    }
};

// Fetch data and initialize
async function initDashboard() {
    try {
        const response = await fetch('data.json');
        rawData = await response.json();
        
        initMap(); // Initialize map once
        updateDashboard(); // Render all components
    } catch (error) {
        console.error("Error loading data:", error);
        alert("กรุณาเปิดไฟล์ผ่าน Live Server หรือ Web Server เพื่อให้โหลด data.json ได้ครับ");
    }
}

// Map Initialization
function initMap() {
    // กำหนดจุดศูนย์กลางของจังหวัดนครพนม
    tourismMap = L.map('tourismMap').setView([17.15, 104.75], 10);
    
    // ใช้ OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(tourismMap);

    // สร้าง LayerGroup สำหรับจัดการ Marker เพื่อให้ลบและสร้างใหม่ได้ง่ายเมื่อ Filter เปลี่ยน
    mapMarkersGroup = L.layerGroup().addTo(tourismMap);
}

// Event Listeners for OLAP Filters
document.getElementById('filterFestival').addEventListener('change', updateDashboard);
document.getElementById('filterStyle').addEventListener('change', updateDashboard);
document.getElementById('filterScore').addEventListener('change', updateDashboard);

function updateDashboard() {
    // 1. Get filter values
    const festivalFilter = document.getElementById('filterFestival').value;
    const styleFilter = document.getElementById('filterStyle').value;
    const scoreFilter = document.getElementById('filterScore').value;

    // 2. Filter data (The Single Source of Truth for all UI components)
    let filteredData = rawData.filter(row => {
        let passFestival = festivalFilter === 'all' ? true : row.isFestival.toString() === festivalFilter;
        let passStyle = styleFilter === 'all' ? true : row.travelStyle === styleFilter;
        
        let passScore = true;
        if (scoreFilter === 'high') passScore = row.satisfaction >= 4.0;
        else if (scoreFilter === 'med') passScore = row.satisfaction >= 3.0 && row.satisfaction < 4.0;
        else if (scoreFilter === 'low') passScore = row.satisfaction < 3.0;

        return passFestival && passStyle && passScore;
    });

    // 3. Update Existing Components
    updateKPIs(filteredData);
    drawVisitorChart(filteredData);
    drawRevenueChart(filteredData);
    drawClusterChart(filteredData);
    renderReviews(filteredData);
    
    // 4. Update New Map Component
    updateMap(filteredData);
}

// Map Update Logic (Task 1 & 2)
function updateMap(data) {
    if (!mapMarkersGroup) return;
    
    // Clear old markers for performance
    mapMarkersGroup.clearLayers();

    // Data Aggregation: Aggregate visitors by location based on filtered dataset
    const locationStats = {};
    let totalMapVisitors = 0;

    data.forEach(row => {
        if (!locationStats[row.location]) {
            locationStats[row.location] = 0;
        }
        locationStats[row.location] += row.visitors;
        totalMapVisitors += row.visitors;
    });

    const activeLocationsCount = Object.keys(locationStats).length;

    // Update Map Summary Header
    const summaryText = activeLocationsCount > 0 
        ? `พบ ${activeLocationsCount} สถานที่ | รวม ${totalMapVisitors.toLocaleString()} คน` 
        : `ไม่พบข้อมูลสถานที่จากเงื่อนไขนี้`;
    document.getElementById('mapSummary').innerText = summaryText;

    // Create Markers
    Object.keys(locationStats).forEach(locName => {
        const meta = locationDictionary[locName];
        if (meta) {
            const visitorCount = locationStats[locName];
            
            // Create Marker
            const marker = L.marker([meta.lat, meta.lng]);
            
            // Popup HTML Design (with real image)
            const popupContent = `
                <div class="w-48">
                    <img src="${meta.img}" 
                         class="w-full h-32 object-cover rounded-t-sm mb-2 shadow-sm" 
                         alt="${locName}" 
                         onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
                    <h4 class="font-bold text-base text-gray-800 leading-tight mb-1">${locName}</h4>
                    <p class="text-[11px] text-gray-600 mb-2 leading-snug">
                        <span class="font-semibold">ประเภท:</span> ${meta.type}<br>
                        <span class="font-semibold">อำเภอ:</span> ${meta.district}
                    </p>
                    <div class="bg-blue-50 border border-blue-100 rounded px-2 py-1 mb-1">
                        <p class="text-sm font-semibold text-blue-700 text-center">นักท่องเที่ยว: ${visitorCount.toLocaleString()} คน</p>
                    </div>
                    <p class="text-[9px] text-gray-400 mt-2 text-right">Cr. ${meta.source}</p>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            mapMarkersGroup.addLayer(marker);
        }
    });
}

// ---------------- EXISTING FUNCTIONS (UNMODIFIED LOGIC) ----------------

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
    
    const top5 = data.slice(0, 5);
    
    if(top5.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 italic p-4 bg-gray-50 rounded">ไม่มีข้อมูลรีวิวที่ตรงกับเงื่อนไขที่เลือก</p>';
        return;
    }

    top5.forEach(row => {
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
