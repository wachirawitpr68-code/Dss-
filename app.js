let rawData = [];
let revenueChartInstance = null;
let clusterChartInstance = null;
let visitorChartInstance = null;
let dssScatterChartInstance = null;

// Map Variables
let tourismMap = null;
let mapMarkersGroup = null;

// 11 Locations Dictionary (Matching user's list + existing)
const locationDictionary = {
    "ลานพญาศรีสัตตนาคราช": {
        lat: 17.3995, lng: 104.7937,
        type: "แลนด์มาร์ก / จุดเช็คอิน", district: "เมืองนครพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Phaya_Si_Sattanakharat.jpg",
        source: "Wikimedia Commons"
    },
    "วัดพระธาตุพนมวรมหาวิหาร": {
        lat: 16.9416, lng: 104.7231,
        type: "ศาสนสถานสำคัญ", district: "ธาตุพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Wat_Phra_That_Phanom2.jpg",
        source: "Wikimedia Commons"
    },
    "ถนนคนเดินนครพนม": {
        lat: 17.4068, lng: 104.7891,
        type: "แหล่งช้อปปิ้ง / ตลาด", district: "เมืองนครพนม",
        img: "",
        source: "-"
    },
    "ชุมชนไทญ้อ": {
        lat: 17.0544, lng: 104.6783,
        type: "ชุมชนวัฒนธรรม", district: "เรณูนคร",
        img: "",
        source: "-"
    },
    "วัดนักบุญอันนา หนองแสง": {
        lat: 17.4191, lng: 104.7818,
        type: "ศาสนสถาน (โบสถ์คริสต์)", district: "เมืองนครพนม",
        img: "",
        source: "-"
    },
    "หอนาฬิกาเวียดนามอนุสรณ์": {
        lat: 17.4055, lng: 104.7885,
        type: "แลนด์มาร์กประวัติศาสตร์", district: "เมืองนครพนม",
        img: "https://upload.wikimedia.org/wikipedia/commons/1/10/Nakhon_Phanom_Clock_Tower.jpg",
        source: "Wikimedia Commons"
    },
    "บ้านลุงโฮจิมินห์ (บ้านนาจอก)": {
        lat: 17.3822, lng: 104.7538,
        type: "สถานที่ประวัติศาสตร์", district: "เมืองนครพนม",
        img: "",
        source: "-"
    },
    "พิพิธภัณฑ์จวนผู้ว่าราชการจังหวัดนครพนม (หลังเก่า)": {
        lat: 17.4095, lng: 104.7850,
        type: "พิพิธภัณฑ์", district: "เมืองนครพนม",
        img: "",
        source: "-"
    },
    "เส้นทางจักรยานริมแม่น้ำโขง (River Walk)": {
        lat: 17.4150, lng: 104.7830,
        type: "สถานที่พักผ่อน / กีฬา", district: "เมืองนครพนม",
        img: "",
        source: "-"
    },
    "อุทยานแห่งชาติภูลังกา": {
        lat: 17.9350, lng: 104.1480,
        type: "อุทยานแห่งชาติ", district: "บ้านแพง",
        img: "https://upload.wikimedia.org/wikipedia/commons/9/9f/%E0%B8%AD%E0%B8%B8%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%99%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4%E0%B8%A0%E0%B8%B9%E0%B8%A5%E0%B8%B1%E0%B8%87%E0%B8%81%E0%B8%B2-%E0%B8%99%E0%B8%84%E0%B8%A3%E0%B8%9E%E0%B8%99%E0%B8%A1-2-600x360.jpg",
        source: "Wikimedia Commons"
    },
    "วัดพระธาตุเรณู": {
        lat: 17.0544, lng: 104.6783,
        type: "ศาสนสถานสำคัญ", district: "เรณูนคร",
        img: "https://upload.wikimedia.org/wikipedia/commons/5/52/Phra_That_Renu_Nakhon.jpg",
        source: "Wikimedia Commons"
    }
};

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
    tourismMap = L.map('tourismMap').setView([17.25, 104.55], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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

    const countEl = document.getElementById('recordCount');
    if (countEl) {
        countEl.innerText = `แสดงข้อมูล ${filteredData.length} จาก ${rawData.length} รายการ`;
    }

    const locationStats = {};
    let totalMapVisitors = 0;
    
    filteredData.forEach(row => {
        if (!locationStats[row.location]) {
            locationStats[row.location] = { visitors: 0, revenue: 0, sumSat: 0, count: 0 };
        }
        locationStats[row.location].visitors += row.visitors;
        locationStats[row.location].revenue += row.revenue;
        locationStats[row.location].sumSat += row.satisfaction;
        locationStats[row.location].count += 1;
        totalMapVisitors += row.visitors;
    });

    updateKPIs(filteredData);
    generateDashboardInsight(filteredData, locationStats);
    drawVisitorChart(filteredData);
    drawRevenueChart(filteredData);
    drawClusterChart(filteredData); 
    renderReviews(filteredData);
    
    updateMap(locationStats, totalMapVisitors);
    renderAttractions(locationStats);
    renderDataMining(filteredData);
}

// ==========================================
// DASHBOARD QUICK INSIGHT
// ==========================================
function generateDashboardInsight(data, locationStats) {
    const insightTextEl = document.getElementById('dashboardInsightText');
    if (data.length === 0) {
        insightTextEl.innerHTML = '<span class="text-red-500">ไม่พบข้อมูล กรุณาปรับเปลี่ยนตัวกรอง</span>';
        return;
    }

    let topLoc = "-"; let maxVis = -1;
    for (const [loc, stat] of Object.entries(locationStats)) {
        if (stat.visitors > maxVis) { maxVis = stat.visitors; topLoc = loc; }
    }

    const cStats = {};
    data.forEach(r => {
        if (!cStats[r.cluster]) cStats[r.cluster] = { vis: 0, rev: 0 };
        cStats[r.cluster].vis += r.visitors;
        cStats[r.cluster].rev += r.revenue;
    });
    let topCluster = "-"; let maxArpu = -1;
    for (const [c, st] of Object.entries(cStats)) {
        let arpu = st.vis > 0 ? st.rev / st.vis : 0;
        if (arpu > maxArpu) { maxArpu = arpu; topCluster = c; }
    }

    insightTextEl.innerHTML = `จากชุดข้อมูลที่เลือก <b>กลุ่ม ${topCluster}</b> มีรายได้เฉลี่ยต่อคน (ARPU) สูงที่สุด และ <b>${topLoc}</b> มีจำนวนผู้เข้าชมสูงที่สุดจากข้อมูลที่ถูกกรองครับ`;
}

// ==========================================
// MAP & ATTRACTIONS LOGIC
// ==========================================
function updateMap(locationStats, totalMapVisitors) {
    if (!mapMarkersGroup) return;
    mapMarkersGroup.clearLayers();
    window.mapMarkers = {}; 

    const activeLocationsCount = Object.keys(locationStats).length;

    let topLocationName = "-";
    let maxVisitors = -1;
    for (const [loc, stat] of Object.entries(locationStats)) {
        if (stat.visitors > maxVisitors) { maxVisitors = stat.visitors; topLocationName = loc; }
    }

    const summaryEl = document.getElementById('mapSummary');
    if (activeLocationsCount > 0) {
        summaryEl.innerHTML = `
            <span class="inline-block mr-3">📍 สถานที่: <span class="text-blue-800">${activeLocationsCount} แห่ง</span></span>
            <span class="inline-block mr-3">👥 นักท่องเที่ยว: <span class="text-blue-800">${totalMapVisitors.toLocaleString()} คน</span></span>
            <span class="inline-block">🏆 ยอดนิยม: <span class="text-green-700">${topLocationName}</span></span>
        `;
    } else {
        summaryEl.innerHTML = `<span class="text-red-500">ไม่พบข้อมูลจาก Filter นี้</span>`;
    }

    Object.keys(locationStats).forEach(locName => {
        const meta = locationDictionary[locName];
        if (meta) {
            const stat = locationStats[locName];
            const avgSat = stat.count > 0 ? (stat.sumSat / stat.count).toFixed(1) : "0.0";
            
            const marker = L.marker([meta.lat, meta.lng]);
            window.mapMarkers[locName] = marker;
            
            // Handle missing image safely without URL fetch error
            const imgHtml = meta.img 
                ? `<img src="${meta.img}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px 6px 0 0; margin-bottom: 8px;" alt="${locName}">`
                : `<div style="width: 100%; height: 140px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius: 6px 6px 0 0; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; text-align: center; padding: 10px; box-sizing: border-box;">${locName}</div>`;

            const popupContent = `
                <div style="width: 250px; font-family: 'Prompt', sans-serif;">
                    ${imgHtml}
                    <div style="padding: 0 4px;">
                        <h4 style="font-weight: bold; font-size: 16px; color: #1e3a8a; margin: 0 0 6px 0; line-height: 1.2;">📍 ${locName}</h4>
                        <p style="font-size: 13px; color: #4b5563; margin: 0 0 8px 0;">🏛️ ${meta.type}</p>
                        
                        <div style="background-color: #f8fafc; font-size: 12px; padding: 6px; border-radius: 4px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: #475569;">👥 ผู้เข้าชม:</span>
                                <span style="font-weight: bold; color: #1d4ed8;">${stat.visitors.toLocaleString()} คน</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="color: #475569;">💰 รายได้รวม:</span>
                                <span style="font-weight: bold; color: #15803d;">฿${stat.revenue.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #475569;">⭐ ความพอใจ:</span>
                                <span style="font-weight: bold; color: #b45309;">${avgSat} / 5</span>
                            </div>
                        </div>

                        <button style="width: 100%; background-color: #2563eb; color: white; border: none; padding: 8px; border-radius: 4px; font-size: 13px; font-weight: bold; cursor: pointer; transition: background-color 0.2s;"
                                onmouseover="this.style.backgroundColor='#1d4ed8'" onmouseout="this.style.backgroundColor='#2563eb'"
                                onclick="openAttractionDetail('${locName}')">
                            ดูรายละเอียด
                        </button>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent, { minWidth: 260, maxWidth: 280 });
            mapMarkersGroup.addLayer(marker);
        }
    });
}

function renderAttractions(locationStats) {
    const grid = document.getElementById('attractionsGrid');
    grid.innerHTML = '';

    Object.keys(locationDictionary).forEach(locName => {
        const meta = locationDictionary[locName];
        const stat = locationStats[locName] || { visitors: 0, revenue: 0, sumSat: 0, count: 0 };
        const avgSat = stat.count > 0 ? (stat.sumSat / stat.count).toFixed(1) : "0.0";

        const imgHtml = meta.img
            ? `<img src="${meta.img}" class="w-full h-full object-cover" alt="${locName}">`
            : `<div class="w-full h-full bg-gradient-to-br from-blue-800 to-indigo-600 flex items-center justify-center p-4 text-center">
                 <span class="text-white font-bold text-xl drop-shadow-md">${locName}</span>
               </div>`;

        const card = document.createElement('div');
        card.className = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col";
        
        card.innerHTML = `
            <div class="h-44 overflow-hidden relative bg-gray-200">
                ${imgHtml}
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                    <h4 class="font-bold text-white text-lg leading-tight truncate" title="${locName}">${locName}</h4>
                </div>
            </div>
            <div class="p-4 flex-grow flex flex-col">
                <div class="text-sm text-gray-600 space-y-1 mb-4 flex-grow border-b border-gray-100 pb-3">
                    <p>📍 อำเภอ${meta.district}</p>
                    <p>🏛️ ${meta.type}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div class="bg-blue-50 p-2 rounded text-center border border-blue-100">
                        <span class="block text-gray-500 mb-0.5">👥 ผู้เข้าชม</span>
                        <span class="font-bold text-blue-800">${stat.visitors.toLocaleString()} คน</span>
                    </div>
                    <div class="bg-green-50 p-2 rounded text-center border border-green-100">
                        <span class="block text-gray-500 mb-0.5">💰 รายได้</span>
                        <span class="font-bold text-green-700">฿${stat.revenue.toLocaleString()}</span>
                    </div>
                    <div class="col-span-2 bg-yellow-50 p-2 rounded text-center border border-yellow-100">
                        <span class="text-gray-500">⭐ ความพึงพอใจ: </span>
                        <span class="font-bold text-yellow-700">${avgSat} / 5</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 mt-auto">
                    <button onclick="openAttractionDetail('${locName}')" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2 rounded transition-colors flex items-center justify-center shadow-sm">
                        📄 ดูรายละเอียด
                    </button>
                    <button onclick="focusOnMap('${locName}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded transition-colors flex items-center justify-center shadow-sm">
                        📍 ดูบนแผนที่
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

    const festivalFilter = document.getElementById('filterFestival').value;
    const styleFilter = document.getElementById('filterStyle').value;
    const scoreFilter = document.getElementById('filterScore').value;
    
    let stat = { vis: 0, rev: 0, sumSat: 0, count: 0 };
    rawData.forEach(row => {
        if (row.location === locName) {
            let passFestival = festivalFilter === 'all' ? true : row.isFestival.toString() === festivalFilter;
            let passStyle = styleFilter === 'all' ? true : row.travelStyle === styleFilter;
            let passScore = true;
            if (scoreFilter === 'high') passScore = row.satisfaction >= 4.0;
            else if (scoreFilter === 'med') passScore = row.satisfaction >= 3.0 && row.satisfaction < 4.0;
            else if (scoreFilter === 'low') passScore = row.satisfaction < 3.0;
            
            if (passFestival && passStyle && passScore) {
                stat.vis += row.visitors;
                stat.rev += row.revenue;
                stat.sumSat += row.satisfaction;
                stat.count += 1;
            }
        }
    });

    const avgSat = stat.count > 0 ? (stat.sumSat / stat.count).toFixed(1) : "0.0";

    const imgEl = document.getElementById('modalImg');
    const fallbackEl = document.getElementById('modalFallbackText');
    
    if (meta.img) {
        imgEl.src = meta.img;
        imgEl.style.display = 'block';
        fallbackEl.style.display = 'none';
    } else {
        imgEl.style.display = 'none';
        fallbackEl.style.display = 'flex';
        fallbackEl.innerText = locName;
    }

    document.getElementById('modalTitle').innerText = locName;
    document.getElementById('modalDistrict').innerText = meta.district;
    document.getElementById('modalType').innerText = meta.type;
    
    document.getElementById('modalVisitors').innerText = `${stat.vis.toLocaleString()}`;
    document.getElementById('modalRevenue').innerText = `฿${stat.rev.toLocaleString()}`;
    document.getElementById('modalSatisfaction').innerText = `${avgSat} / 5`;
    
    document.getElementById('modalSource').innerText = meta.source;
    document.getElementById('modalMapBtn').onclick = () => focusOnMap(locName);

    document.getElementById('attractionModal').classList.remove('hidden');
}

function closeAttractionDetail() {
    document.getElementById('attractionModal').classList.add('hidden');
}

function focusOnMap(locName) {
    closeAttractionDetail();
    switchTab('dashboard');
    setTimeout(() => {
        const meta = locationDictionary[locName];
        if (meta && window.mapMarkers && window.mapMarkers[locName]) {
            tourismMap.flyTo([meta.lat, meta.lng], 14, { duration: 1.5 });
            window.mapMarkers[locName].openPopup();
        }
    }, 300);
}

// ==========================================
// PHASE 3: DATA MINING & DSS LOGIC
// ==========================================
function renderDataMining(data) {
    const containerCards = document.getElementById('dssClusterCards');
    const containerRecs = document.getElementById('dssRecommendations');

    if (data.length === 0) {
        containerCards.innerHTML = '<div class="col-span-full text-red-500 bg-red-50 p-4 rounded text-center">ไม่พบข้อมูลตามเงื่อนไข Filter ปัจจุบัน กรุณาปรับเปลี่ยน Filter</div>';
        containerRecs.innerHTML = '';
        if (dssScatterChartInstance) dssScatterChartInstance.destroy();
        return;
    }

    const clusterStats = {};
    let totalVis = 0;
    let systemRevenue = 0;

    data.forEach(row => {
        if (!clusterStats[row.cluster]) {
            clusterStats[row.cluster] = { visitors: 0, revenue: 0, sumSat: 0, count: 0 };
        }
        clusterStats[row.cluster].visitors += row.visitors;
        clusterStats[row.cluster].revenue += row.revenue;
        clusterStats[row.cluster].sumSat += row.satisfaction;
        clusterStats[row.cluster].count += 1;
        totalVis += row.visitors;
        systemRevenue += row.revenue;
    });

    const avgSystemArpu = totalVis > 0 ? (systemRevenue / totalVis) : 0;
    const avgSystemVis = totalVis / Object.keys(clusterStats).length;
    let sumSystemSat = 0; let countSystemSat = 0;
    Object.values(clusterStats).forEach(s => { sumSystemSat += s.sumSat; countSystemSat += s.count; });
    const avgSystemSat = countSystemSat > 0 ? (sumSystemSat / countSystemSat) : 0;

    containerCards.innerHTML = '';
    let recsHTML = ``;

    Object.keys(clusterStats).forEach(c => {
        const stat = clusterStats[c];
        stat.arpu = stat.visitors > 0 ? (stat.revenue / stat.visitors) : 0;
        stat.avgSat = stat.count > 0 ? (stat.sumSat / stat.count) : 0;
        stat.pct = totalVis > 0 ? (stat.visitors / totalVis) * 100 : 0;

        let traitDescription = "";
        if (stat.arpu > avgSystemArpu) {
            traitDescription += "มีการใช้จ่ายเฉลี่ยสูง ";
        } else {
            traitDescription += "เน้นการเดินทางแบบประหยัด ";
        }
        if (stat.visitors > avgSystemVis) {
            traitDescription += "และเป็นกลุ่มที่มีปริมาณคนจำนวนมาก";
        } else {
            traitDescription += "และเป็นกลุ่มเฉพาะ (Niche)";
        }

        containerCards.innerHTML += `
            <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <h4 class="font-bold text-lg text-blue-900 mb-1 border-b border-gray-100 pb-2">${c}</h4>
                <div class="text-xs text-gray-500 font-semibold mb-4 bg-gray-100 px-2 py-1 rounded inline-block">${stat.visitors.toLocaleString()} คน (${stat.pct.toFixed(1)}%)</div>
                
                <div class="grid grid-cols-1 gap-y-2 text-sm text-gray-700 mb-4">
                    <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span class="text-gray-500">รายได้เฉลี่ยต่อคน:</span>
                        <span class="font-bold text-green-700">฿${Math.round(stat.arpu).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span class="text-gray-500">ความพึงพอใจเฉลี่ย:</span>
                        <span class="font-bold text-yellow-600">${stat.avgSat.toFixed(2)} / 5</span>
                    </div>
                </div>
                
                <div class="text-xs text-gray-600 border-t border-dashed pt-3">
                    <span class="font-bold text-gray-800 block mb-1">ลักษณะสำคัญ:</span>
                    ${traitDescription}
                </div>
            </div>
        `;

        let action = "";
        let theme = "bg-gray-50 border-gray-200 text-gray-800";
        let icon = "💡";
        
        if (stat.arpu > avgSystemArpu && stat.visitors <= avgSystemVis) {
            action = `รายได้เฉลี่ยต่อคนสูง (฿${Math.round(stat.arpu).toLocaleString()}) แต่ยังมีจำนวนผู้เข้าชมน้อย: <b>ควรส่งเสริมการตลาดและโปรโมชันเพื่อเพิ่มจำนวนผู้เข้าชมเจาะกลุ่ม ${c}</b>`;
            theme = "bg-blue-50 border-blue-200 text-blue-900";
            icon = "🎯";
        } else if (stat.visitors > avgSystemVis && stat.avgSat < avgSystemSat) {
            action = `จำนวนผู้เข้าชมสูง แต่ความพึงพอใจเฉลี่ยค่อนข้างต่ำ (${stat.avgSat.toFixed(2)}/5): <b>ควรเร่งปรับปรุงคุณภาพการให้บริการและสิ่งอำนวยความสะดวกสำหรับกลุ่ม ${c}</b>`;
            theme = "bg-red-50 border-red-200 text-red-900";
            icon = "🛠️";
        } else if (stat.arpu > avgSystemArpu && stat.visitors > avgSystemVis) {
            action = `เป็นกลุ่มแกนหลักที่ทำรายได้และปริมาณสูง: <b>ควรรักษามาตรฐาน บริหารจัดการคน และเพิ่มกิจกรรมสร้างมูลค่าเพื่อกลุ่ม ${c}</b>`;
            theme = "bg-green-50 border-green-200 text-green-900";
            icon = "🌟";
        } else {
            action = `กลุ่มผู้เยี่ยมชมทั่วไป: <b>ควรส่งเสริมการท่องเที่ยวในช่วงนอกเทศกาลเพื่อดึงดูดกลุ่ม ${c} ให้กระจายรายได้เข้าพื้นที่</b>`;
            theme = "bg-purple-50 border-purple-200 text-purple-900";
            icon = "📢";
        }

        recsHTML += `
            <div class="${theme} p-4 rounded-lg border hover:shadow-md transition">
                <div class="flex items-start gap-2">
                    <span class="text-lg">${icon}</span>
                    <p class="text-sm leading-relaxed">${action}</p>
                </div>
            </div>
        `;
    });

    containerRecs.innerHTML = recsHTML;
    drawDssScatterChart(data);
}

function drawDssScatterChart(data) {
    const ctx = document.getElementById('dssScatterChart').getContext('2d');
    const clusterColors = {
        "Family Chill-Out": "rgba(34, 197, 94, 0.8)",
        "Solo Explorer": "rgba(234, 179, 8, 0.8)",
        "Festival Spenders": "rgba(239, 68, 68, 0.8)"
    };

    const datasets = [];
    const clusters = [...new Set(data.map(d => d.cluster))];

    clusters.forEach(clusterName => {
        const clusterPoints = data.filter(d => d.cluster === clusterName).map(d => {
            let arpu = d.visitors > 0 ? (d.revenue / d.visitors) : 0;
            return {
                x: d.satisfaction,
                y: arpu,
                location: d.location,
                visitors: d.visitors
            };
        });

        datasets.push({
            label: clusterName,
            data: clusterPoints,
            backgroundColor: clusterColors[clusterName] || 'rgba(156, 163, 175, 0.8)',
            pointRadius: (ctx) => {
                let v = ctx.raw ? ctx.raw.visitors : 10;
                return Math.max(5, Math.min(25, v / 15));
            },
            pointHoverRadius: 12
        });
    });

    if (dssScatterChartInstance) dssScatterChartInstance.destroy();

    dssScatterChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'คะแนนความพึงพอใจ (1-5 ดาว)' }, min: 1, max: 5 },
                y: { title: { display: true, text: 'รายได้เฉลี่ยต่อคน (ARPU)' }, beginAtZero: true }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `[${ctx.raw.location}] พอใจ: ${ctx.raw.x}⭐ | ARPU: ฿${Math.round(ctx.raw.y)} | คน: ${ctx.raw.visitors}`
                    }
                }
            }
        }
    });
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
            scales: { x: { title: { display: true, text: 'คะแนนความพึงพอใจ (1-5)' }, min: 1, max: 5 }, y: { title: { display: true, text: 'รายได้รวมของรายการ (บาท)' }, beginAtZero: true } },
            plugins: { tooltip: { callbacks: { label: (ctx) => `พอใจ: ${ctx.raw.x}, รายได้: ฿${ctx.raw.y.toLocaleString()} (${ctx.raw.location})` } } }
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
        div.className = `p-4 bg-gray-50 rounded-lg border-l-4 ${borderColor} flex justify-between items-start gap-4 hover:bg-gray-100 transition`;
        div.innerHTML = `
            <div>
                <p class="text-sm font-semibold text-gray-800">${row.location} <span class="text-xs text-gray-500 font-normal ml-2 bg-gray-200 px-2 py-1 rounded-full">${row.travelStyle} | ${row.month}</span></p>
                <p class="text-sm text-gray-700 mt-2 italic">"${row.review}"</p>
            </div>
            <div class="text-right whitespace-nowrap bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                <span class="font-bold ${starColor}">⭐ ${row.satisfaction.toFixed(1)}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

initDashboard();
