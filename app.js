let rawData = [];
let revenueChartInstance = null;
let clusterChartInstance = null;
let visitorChartInstance = null;

// Map Variables
let tourismMap = null;
let mapMarkersGroup = null;

// Location Meta Data (Virtual Dimension Table for Map & Attractions)
const locationDictionary = {
    "ลานพญาศรีสัตตนาคราช": {
        lat: 17.3995, lng: 104.7937,
        type: "แลนด์มาร์ก / จุดเช็คอิน", district: "เมืองนครพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Phaya_Si_Sattanakharat.jpg",
        source: "Wikimedia Commons"
    },
    "วัดพระธาตุพนม": {
        lat: 16.9416, lng: 104.7231,
        type: "ศาสนสถานสำคัญ", district: "ธาตุพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Wat_Phra_That_Phanom2.jpg",
        source: "Wikimedia Commons"
    },
    "ถนนคนเดินนครพนม": {
        lat: 17.4068, lng: 104.7891,
        type: "แหล่งช้อปปิ้ง / ตลาด", district: "เมืองนครพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/1/10/Nakhon_Phanom_Clock_Tower.jpg",
        source: "Wikimedia Commons"
    },
    "ชุมชนไทญ้อ": {
        lat: 17.0544, lng: 104.6783,
        type: "ชุมชนวัฒนธรรม", district: "เรณูนคร",
        img: "https://upload.wikimedia.org/wikipedia/commons/5/52/Phra_That_Renu_Nakhon.jpg",
        source: "Wikimedia Commons"
    }
};

// Global object to store marker references for Deep Linking
window.mapMarkers = {}; 

// ==========================================
// NAVIGATION LOGIC
// ==========================================
function switchTab(tabName) {
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-attractions').classList.add('hidden');
    document.getElementById('view-datamining').classList.add('hidden');
    
    const navIds = ['nav-dashboard', 'nav-attractions', 'nav-datamining'];
    navIds.forEach(id => {
        const btn = document.getElementById(id);
        btn.classList.remove('border-b-2', 'border-white', 'pb-1');
        btn.classList.add('text-blue-200');
    });

    document.getElementById('view-' + tabName).classList.remove('hidden');
    const activeBtn = document.getElementById('nav-' + tabName);
    activeBtn.classList.remove('text-blue-200');
    activeBtn.classList.add('border-b-2', 'border-white', 'pb-1');

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
    const festivalFilter = document.getElementById('filterFestival').value;
    const styleFilter = document.getElementById('filterStyle').value;
    const scoreFilter = document.getElementById('filterScore').value;

    let filteredData = rawData.filter(row => {
        let passFestival = festivalFilter === 'all' ? true : row.isFestival.toString() === festivalFilter;
        let passStyle = styleFilter === 'all' ? true : row.travelStyle === styleFilter;
        let passScore = true;
        if (scoreFilter === 'high') passScore = row.satisfaction >= 4.0;
        else if (scoreFilter === 'med') passScore = row.satisfaction >= 3.0 && row.satisfaction < 4.0;
        else if (scoreFilter === 'low') passScore = row.satisfaction < 3.0;
        return passFestival && passStyle && passScore;
    });

    updateKPIs(filteredData);
    drawVisitorChart(filteredData);
    drawRevenueChart(filteredData);
    drawClusterChart(filteredData);
    renderReviews(filteredData);
    updateMap(filteredData);
    
    // NEW: Render Attractions Cards using the exact same filtered data
    renderAttractions(filteredData);
}

// ==========================================
// MAP UPDATE LOGIC 
// ==========================================
function updateMap(data) {
    if (!mapMarkersGroup) return;
    mapMarkersGroup.clearLayers();
    window.mapMarkers = {}; // Reset marker references

    const locationStats = {};
    let totalMapVisitors = 0;

    data.forEach(row => {
        if (!locationStats[row.location]) locationStats[row.location] = 0;
        locationStats[row.location] += row.visitors;
        totalMapVisitors += row.visitors;
    });

    const activeLocationsCount = Object.keys(locationStats).length;

    let topLocationName = "-";
    let maxVisitors = -1;
    for (const [loc, vis] of Object.entries(locationStats)) {
        if (vis > maxVisitors) {
            maxVisitors = vis;
            topLocationName = loc;
        }
    }

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

    Object.keys(locationStats).forEach(locName => {
        const meta = locationDictionary[locName];
        if (meta) {
            const visitorCount = locationStats[locName];
            const marker = L.marker([meta.lat, meta.lng]);
            window.mapMarkers[locName] = marker; // Store for Deep Linking
            
            const popupContent = `
                <div style="width: 240px; font-family: 'Prompt', sans-serif;">
                    <img src="${meta.img}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px 6px 0 0; margin-bottom: 8px;" alt="${locName}" onerror="this.src='https://via.placeholder.com/300x200?text=Not+Found'">
                    <div style="padding: 0 4px;">
                        <h4 style="font-weight: bold; font-size: 16px; color: #1e3a8a; margin: 0 0 6px 0; line-height: 1.2;">${locName}</h4>
                        <p style="font-size: 13px; color: #4b5563; margin: 0 0 4px 0;">📍 อำเภอ${meta.district}</p>
                        <p style="font-size: 13px; color: #4b5563; margin: 0 0 8px 0;">🏛️ ${meta.type}</p>
                        <div style="background-color: #eff6ff; color: #1d4ed8; font-weight: 600; font-size: 13px; padding: 6px; border-radius: 4px; text-align: center; margin-bottom: 10px; border: 1px solid #bfdbfe;">
                            👥 นักท่องเที่ยว: ${visitorCount.toLocaleString()} คน
                        </div>
                        <button style="width: 100%; background-color: #2563eb; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 13px; font-weight: bold; cursor: pointer; transition: background-color 0.2s;"
                                onmouseover="this.style.backgroundColor='#1d4ed8'" onmouseout="this.style.backgroundColor='#2563eb'"
                                onclick="openAttractionDetail('${locName}')">
                            ดูรายละเอียด
                        </button>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent, { minWidth: 250, maxWidth: 260 });
            mapMarkersGroup.addLayer(marker);
        }
    });
}

// ==========================================
// PHASE 2: ATTRACTIONS & MODAL LOGIC
// ==========================================

function renderAttractions(filteredData) {
    // 1. Aggregate visitors to ensure Cards match Filter State
    const locationStats = {};
    filteredData.forEach(row => {
        if (!locationStats[row.location]) locationStats[row.location] = 0;
        locationStats[row.location] += row.visitors;
    });

    const grid = document.getElementById('attractionsGrid');
    grid.innerHTML = '';

    // 2. Loop through our master location dictionary to build cards
    Object.keys(locationDictionary).forEach(locName => {
        const meta = locationDictionary[locName];
        // If 0 visitors after filter, we can still show the card with "0", or hide it. 
        // Showing it with 0 is usually better for a DSS to see what's excluded.
        const visitorCount = locationStats[locName] || 0;

        const card = document.createElement('div');
        card.className = "bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col";
        
        card.innerHTML = `
            <div class="h-40 overflow-hidden relative bg-gray-200">
                <img src="${meta.img}" class="w-full h-full object-cover" alt="${locName}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                    <h4 class="font-bold text-white text-lg leading-tight truncate" title="${locName}">${locName}</h4>
                </div>
            </div>
            <div class="p-4 flex-grow flex flex-col">
                <div class="text-sm text-gray-600 space-y-1 mb-4 flex-grow">
                    <p>📍 อำเภอ${meta.district}</p>
                    <p>🏛️ ${meta.type}</p>
                    <p class="font-semibold text-blue-800 bg-blue-50 px-2 py-1 rounded inline-block mt-2 border border-blue-100">
                        👥 นักท่องเที่ยว: ${visitorCount.toLocaleString()} คน
                    </p>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-auto">
                    <button onclick="openAttractionDetail('${locName}')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded transition-colors flex items-center justify-center">
                        📄 รายละเอียด
                    </button>
                    <button onclick="focusOnMap('${locName}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded transition-colors flex items-center justify-center">
                        📍 ดูแผนที่
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function openAttractionDetail(locName) {
    const meta = locationDictionary[locName];
    if (!meta) return;

    // To ensure modal shows real-time filtered stats, recalculate just to be safe
    // using the DOM filter states.
    const festivalFilter = document.getElementById('filterFestival').value;
    const styleFilter = document.getElementById('filterStyle').value;
    const scoreFilter = document.getElementById('filterScore').value;
    
    let visitorCount = 0;
    rawData.forEach(row => {
        if (row.location === locName) {
            let passFestival = festivalFilter === 'all' ? true : row.isFestival.toString() === festivalFilter;
            let passStyle = styleFilter === 'all' ? true : row.travelStyle === styleFilter;
            let passScore = true;
            if (scoreFilter === 'high') passScore = row.satisfaction >= 4.0;
            else if (scoreFilter === 'med') passScore = row.satisfaction >= 3.0 && row.satisfaction < 4.0;
            else if (scoreFilter === 'low') passScore = row.satisfaction < 3.0;
            
            if (passFestival && passStyle && passScore) visitorCount += row.visitors;
        }
    });

    // Populate Modal
    document.getElementById('modalImg').src = meta.img;
    document.getElementById('modalTitle').innerText = locName;
    document.getElementById('modalDistrict').innerText = meta.district;
    document.getElementById('modalType').innerText = meta.type;
    document.getElementById('modalCoords').innerText = `${meta.lat}, ${meta.lng}`;
    document.getElementById('modalVisitors').innerText = `${visitorCount.toLocaleString()} คน`;
    document.getElementById('modalSource').innerText = meta.source;
    
    // Wire up the map button inside the modal
    document.getElementById('modalMapBtn').onclick = () => focusOnMap(locName);

    // Show modal
    document.getElementById('attractionModal').classList.remove('hidden');
}

function closeAttractionDetail() {
    document.getElementById('attractionModal').classList.add('hidden');
}

function focusOnMap(locName) {
    // 1. Close Modal if it's open
    closeAttractionDetail();
    // 2. Switch to Dashboard tab
    switchTab('dashboard');
    
    // 3. Pan map and open popup (with a slight delay to allow DOM render)
    setTimeout(() => {
        const meta = locationDictionary[locName];
        if (meta && window.mapMarkers && window.mapMarkers[locName]) {
            // Smoothly pan and zoom to the location
            tourismMap.flyTo([meta.lat, meta.lng], 14, { duration: 1.5 });
            // Open the Leaflet Popup
            window.mapMarkers[locName].openPopup();
        }
    }, 300);
}


// ==========================================
// EXISTING CHART & KPI LOGIC
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
    data.forEach(row => { if(visitorsByMonth[row.month] !== undefined) visitorsByMonth[row.month] += row.visitors; });
    const labels = monthsOrder;
    const values = labels.map(m => visitorsByMonth[m]);
    if (visitorChartInstance) visitorChartInstance.destroy();
    visitorChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [{ label: 'จำนวนนักท่องเที่ยว (คน)', data: values, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: 'rgba(16, 185, 129, 1)', pointRadius: 5 }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function drawRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const revenueByLocation = {};
    data.forEach(row => { revenueByLocation[row.location] = (revenueByLocation[row.location] || 0) + row.revenue; });
    const labels = Object.keys(revenueByLocation);
    const values = Object.values(revenueByLocation);
    if (revenueChartInstance) revenueChartInstance.destroy();
    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'รายได้ชุมชน (บาท)', data: values, backgroundColor: 'rgba(59, 130, 246, 0.7)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 1, borderRadius: 4 }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function drawClusterChart(data) {
    const ctx = document.getElementById('clusterChart').getContext('2d');
    const clusterColors = { "Family Chill-Out": "rgba(34, 197, 94, 0.7)", "Solo Explorer": "rgba(234, 179, 8, 0.7)", "Festival Spenders": "rgba(239, 68, 68, 0.7)" };
    const datasets = [];
    const clusters = [...new Set(data.map(d => d.cluster))];
    clusters.forEach(clusterName => {
        const clusterPoints = data.filter(d => d.cluster === clusterName).map(d => ({ x: d.satisfaction, y: d.revenue, location: d.location }));
        datasets.push({ label: clusterName, data: clusterPoints, backgroundColor: clusterColors[clusterName] || 'rgba(156, 163, 175, 0.7)', pointRadius: 8, pointHoverRadius: 10 });
    });
    if (clusterChartInstance) clusterChartInstance.destroy();
    clusterChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            responsive: true,
            scales: { x: { title: { display: true, text: 'คะแนนความพึงพอใจ (1-5)' }, min: 1, max: 5 }, y: { title: { display: true, text: 'รายได้ (บาท)' }, beginAtZero: true } },
            plugins: { tooltip: { callbacks: { label: (ctx) => `พอใจ: ${ctx.raw.x}, รายได้: ${ctx.raw.y}฿ (${ctx.raw.location})` } } }
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
