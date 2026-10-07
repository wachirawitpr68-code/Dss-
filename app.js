let rawData = [];
let revenueChartInstance = null;
let clusterChartInstance = null;
let visitorChartInstance = null;

// Map Variables
let tourismMap = null;
let mapMarkersGroup = null;

// Location Meta Data (Virtual Dimension Table for Map)
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
        lat: 17.4068, lng: 104.7891,
        type: "แหล่งช้อปปิ้ง / ตลาด", district: "เมืองนครพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Nakhon_Phanom_Clock_Tower.jpg/800px-Nakhon_Phanom_Clock_Tower.jpg",
        source: "Wikimedia Commons"
    },
    "ชุมชนไทญ้อ": {
        lat: 17.0544, lng: 104.6783,
        type: "ชุมชนวัฒนธรรม", district: "เรณูนคร",
        img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Phra_That_Renu_Nakhon.jpg/800px-Phra_That_Renu_Nakhon.jpg",
        source: "Wikimedia Commons"
    }
};

// ==========================================
// NAVIGATION LOGIC
// ==========================================
function switchTab(tabName) {
    // Hide all views
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-attractions').classList.add('hidden');
    document.getElementById('view-datamining').classList.add('hidden');
    
    // Reset Nav buttons style
    const navIds = ['nav-dashboard', 'nav-attractions', 'nav-datamining'];
    navIds.forEach(id => {
        const btn = document.getElementById(id);
        btn.classList.remove('border-b-2', 'border-white', 'pb-1');
        btn.classList.add('text-blue-200');
    });

    // Show active view and update nav style
    document.getElementById('view-' + tabName).classList.remove('hidden');
    
    const activeBtn = document.getElementById('nav-' + tabName);
    activeBtn.classList.remove('text-blue-200');
    activeBtn.classList.add('border-b-2', 'border-white', 'pb-1');

    // Fix map rendering bug when switching tabs back to map
    if (tabName === 'dashboard' && tourismMap) {
        setTimeout(() => tourismMap.invalidateSize(), 100);
    }
}

// ==========================================
// INITIALIZATION
// ==========================================
async function initDashboard() {
    try {
        const response = await fetch('data.json');
        rawData = await response.json();
        
        initMap(); 
        updateDashboard(); 
    } catch (error) {
        console.error("Error loading data:", error);
        alert("กรุณาเปิดไฟล์ผ่าน Live Server หรือ Web Server เพื่อให้โหลด data.json ได้ครับ");
    }
}

function initMap() {
    tourismMap = L.map('tourismMap').setView([17.15, 104.75], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(tourismMap);
    mapMarkersGroup = L.layerGroup().addTo(tourismMap);
}

// ==========================================
// EXISTING FILTERS & CORE LOGIC
// ==========================================
document.getElementById('filterFestival').addEventListener('change', updateDashboard);
document.getElementById('filterStyle').addEventListener('change', updateDashboard);
document.getElementById('filterScore').addEventListener('change', updateDashboard);

function updateDashboard() {
    // 1. Get filter values (SINGLE SOURCE OF TRUTH)
    const festivalFilter = document.getElementById('filterFestival').value;
    const styleFilter = document.getElementById('filterStyle').value;
    const scoreFilter = document.getElementById('filterScore').value;

    // 2. Filter data (This affects Charts, KPI, and Map simultaneously)
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
    
    // 4. Update Map based on same filtered data
    updateMap(filteredData);
}

// ==========================================
// MAP UPDATE LOGIC (PHASE 1 ENHANCED)
// ==========================================
function updateMap(data) {
    if (!mapMarkersGroup) return;
    mapMarkersGroup.clearLayers();

    // Data Aggregation: sum visitors per location
    const locationStats = {};
    let totalMapVisitors = 0;

    data.forEach(row => {
        if (!locationStats[row.location]) locationStats[row.location] = 0;
        locationStats[row.location] += row.visitors;
        totalMapVisitors += row.visitors;
    });

    const activeLocationsCount = Object.keys(locationStats).length;

    // Find Top Location
    let topLocationName = "-";
    let maxVisitors = -1;
    for (const [loc, vis] of Object.entries(locationStats)) {
        if (vis > maxVisitors) {
            maxVisitors = vis;
            topLocationName = loc;
        }
    }

    // Update Map Summary Header
    const summaryEl = document.getElementById('mapSummary');
    if (activeLocationsCount > 0) {
        summaryEl.innerHTML = `
            <span class="inline-block mr-3">📍 สถานที่: <span class="text-blue-700">${activeLocationsCount} แห่ง</span></span>
            <span class="inline-block mr-3">👥 นักท่องเที่ยว: <span class="text-blue-700">${totalMapVisitors.toLocaleString()} คน</span></span>
            <span class="inline-block">🏆 ยอดนิยม: <span class="text-green-600">${topLocationName}</span></span>
        `;
    } else {
        summaryEl.innerHTML = `<span class="text-red-500">ไม่พบข้อมูลจาก Filter นี้</span>`;
    }

    // Draw Markers
    Object.keys(locationStats).forEach(locName => {
        const meta = locationDictionary[locName];
        if (meta) {
            const visitorCount = locationStats[locName];
            const marker = L.marker([meta.lat, meta.lng]);
            
            // Popup HTML Design (Strictly following user requirements)
            const popupContent = `
                <div class="w-48 font-sans">
                    <h4 class="font-bold text-[15px] text-gray-800 leading-tight mb-1">${locName}</h4>
                    <div class="text-[12px] text-gray-600 mb-2 leading-snug space-y-0.5">
                        <p>📍 อำเภอ${meta.district}</p>
                        <p>🏛️ ${meta.type}</p>
                        <p class="font-semibold text-blue-700 mt-1 bg-blue-50 px-1 py-0.5 rounded">
                            👥 นักท่องเที่ยว: ${visitorCount.toLocaleString()} คน
                        </p>
                    </div>
                    <img src="${meta.img}" class="w-full h-24 object-cover rounded mb-2 border border-gray-200" alt="${locName}">
                    <button class="w-full bg-blue-600 hover:bg-blue-700 text-white text-[12px] py-1.5 rounded shadow-sm transition-colors" 
                            onclick="alert('ดูรายละเอียดของ: ${locName} (เตรียมพัฒนาใน Phase ถัดไป)')">
                        ดูรายละเอียด
                    </button>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            mapMarkersGroup.addLayer(marker);
        }
    });
}

// ==========================================
// EXISTING CHART & KPI LOGIC (UNTOUCHED)
// ==========================================

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
        if(visitorsByMonth[row.month] !== undefined) visitorsByMonth[row.month] += row.visitors;
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
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
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
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
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
                        label: (ctx) => `พอใจ: ${ctx.raw.x}, รายได้: ${ctx.raw.y}฿ (${ctx.raw.location})`
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
        container.innerHTML = '<p class="text-sm text-gray-500 italic p-4 bg-gray-50 rounded">ไม่มีข้อมูลรีวิว</p>';
        return;
    }

    top5.forEach(row => {
        let borderColor = row.satisfaction >= 4.0 ? 'border-green-500' : (row.satisfaction >= 3.0 ? 'border-yellow-500' : 'border-red-500');
        let starColor = row.satisfaction >= 4.0 ? 'text-green-600' : (row.satisfaction >= 3.0 ? 'text-yellow-600' : 'text-red-600');
        
        const div = document.createElement('div');
        div.className = `p-4 bg-gray-50 rounded-lg border-l-4 ${borderColor} flex justify-between items-start gap-4 hover:bg-gray-100`;
        div.innerHTML = `
            <div>
                <p class="text-sm font-semibold text-gray-800">${row.location} <span class="text-xs text-gray-500 font-normal ml-2 bg-gray-200 px-2 py-1 rounded-full">${row.travelStyle} | ${row.month}</span></p>
                <p class="text-sm text-gray-700 mt-2 italic">"${row.review}"</p>
            </div>
            <div class="text-right whitespace-nowrap bg-white px-3 py-1 rounded-full border border-gray-100">
                <span class="font-bold ${starColor}">⭐ ${row.satisfaction.toFixed(1)}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

initDashboard();
