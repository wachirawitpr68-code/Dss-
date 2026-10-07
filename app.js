let rawData = [];
let revenueChartInstance = null;
let visitorChartInstance = null;
let dssScatterChartInstance = null;

// Map Variables
let tourismMap = null;
let mapMarkersGroup = null;

// Design System Colors (Sunset Glassmorphism Theme)
const colors = {
    bg: '#0F172A',
    surface: 'rgba(15, 23, 42, 0.75)',
    surfaceLight: 'rgba(30, 41, 59, 0.75)',
    primary: '#60A5FA',       // Sky Blue
    sunset: '#F97316',        // Sunset Orange
    twilight: '#C084FC',      // Twilight Purple
    gold: '#F59E0B',          // Naga Gold
    warmGold: '#FDE047',      // Sun Yellow
    text: '#F8FAFC',          // Text
    muted: '#94A3B8',         // Muted Text
    border: 'rgba(255, 255, 255, 0.15)', // Border
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171'
};

// 11 Locations Dictionary (Unchanged Logic)
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

// Chart.js Dark Theme Setup
Chart.defaults.font.family = "'Prompt', sans-serif";
Chart.defaults.color = colors.muted;
Chart.defaults.scale.grid.color = colors.border;
Chart.defaults.scale.grid.borderColor = colors.border;

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
        btn.classList.remove('border-b-2', 'border-brand-orange', 'text-brand-yellow', 'bg-brand-surface');
        btn.classList.add('border-transparent', 'text-brand-muted', 'bg-transparent');
    });

    document.getElementById('view-' + tabName).classList.remove('hidden');
    const activeBtn = document.getElementById('nav-' + tabName);
    activeBtn.classList.remove('border-transparent', 'text-brand-muted', 'bg-transparent');
    activeBtn.classList.add('border-b-2', 'border-brand-orange', 'text-brand-yellow', 'bg-brand-surface');

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
    // Using standard OSM with CSS filter for dark underwater theme
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        className: 'map-tiles-dark'
    }).addTo(tourismMap);
    mapMarkersGroup = L.layerGroup().addTo(tourismMap);
}

// ==========================================
// EXISTING FILTERS & CORE LOGIC
// ==========================================
document.getElementById('filterFestival').addEventListener('change', updateDashboard);
document.getElementById('filterStyle').addEventListener('change', updateDashboard);
document.getElementById('filterScore').addEventListener('change', updateDashboard);
document.getElementById('filterYear').addEventListener('change', updateDashboard);
document.getElementById('filterLocation').addEventListener('change', updateDashboard);

function updateDashboard() {
    const festivalFilter = document.getElementById('filterFestival').value;
    const styleFilter = document.getElementById('filterStyle').value;
    const scoreFilter = document.getElementById('filterScore').value;
    const yearFilter = document.getElementById('filterYear').value;
    const locationFilter = document.getElementById('filterLocation').value;

    let filteredData = rawData.filter(row => {
        let passYear = yearFilter === 'all' ? true : row.year.toString() === yearFilter;
        let passLoc = locationFilter === 'all' ? true : row.location === locationFilter;
        let passFestival = festivalFilter === 'all' ? true : row.isFestival.toString() === festivalFilter;
        let passStyle = styleFilter === 'all' ? true : row.travelStyle === styleFilter;
        let passScore = true;
        
        if (scoreFilter === 'high') passScore = row.satisfaction >= 4.0;
        else if (scoreFilter === 'med') passScore = row.satisfaction >= 3.0 && row.satisfaction < 4.0;
        else if (scoreFilter === 'low') passScore = row.satisfaction < 3.0;
        
        return passYear && passLoc && passFestival && passStyle && passScore;
    });

    const countActiveEl = document.getElementById('recordCountActive');
    const countTotalEl = document.getElementById('recordCountTotal');
    if (countActiveEl && countTotalEl) {
        countActiveEl.innerText = filteredData.length.toLocaleString();
        countTotalEl.innerText = `/ ${rawData.length.toLocaleString()}`;
    }

    if (filteredData.length === 0) {
        document.getElementById('globalEmptyState').classList.remove('hidden');
    } else {
        document.getElementById('globalEmptyState').classList.add('hidden');
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
    calculatePredictiveAI(filteredData);
    drawVisitorChart(filteredData);
    drawRevenueChart(filteredData);
    
    updateMap(locationStats, totalMapVisitors);
    renderAttractions(locationStats);
    renderDataMining(filteredData);
}

// ==========================================
// PREDICTIVE AI LOGIC (Linear Regression)
// ==========================================
function calculatePredictiveAI(data) {
    const el = document.getElementById('aiPredictionResult');
    if (!el) return;

    const yearlyData = {};
    data.forEach(r => {
        if(!yearlyData[r.year]) yearlyData[r.year] = 0;
        yearlyData[r.year] += r.visitors;
    });

    const years = Object.keys(yearlyData).sort();
    
    if (years.length < 2) {
        el.innerHTML = `
            <div class="text-brand-muted opacity-80 text-sm">
                <p>⚠️ ต้องการข้อมูลย้อนหลัง 2 ปีขึ้นไป กรุณาเลือก <strong>"ทุกปี"</strong></p>
            </div>
        `;
        return;
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    let n = years.length;
    
    years.forEach((yr, i) => {
        let x = i;
        let y = yearlyData[yr];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    });

    let m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX); 
    let b = (sumY - m * sumX) / n; 
    
    let nextX = n; 
    let nextYear = parseInt(years[years.length-1]) + 1;
    let predictedY = Math.max(0, m * nextX + b);
    let currentY = yearlyData[years[years.length-1]];

    let growthPercent = currentY > 0 ? ((predictedY - currentY) / currentY) * 100 : 0;
    
    let arrow = ""; let trendColor = ""; let bgLight = ""; let trendText = "";
    if (m > 0 && growthPercent > 1) {
        arrow = "↑"; trendColor = "text-brand-success"; bgLight = "bg-brand-success/10 border-brand-success/30"; trendText = "แนวโน้มเติบโต";
    } else if (m < 0 && growthPercent < -1) {
        arrow = "↓"; trendColor = "text-brand-danger"; bgLight = "bg-brand-danger/10 border-brand-danger/30"; trendText = "แนวโน้มหดตัว";
    } else {
        arrow = "→"; trendColor = "text-brand-primary"; bgLight = "bg-brand-primary/10 border-brand-primary/30"; trendText = "แนวโน้มคงที่";
    }

    el.innerHTML = `
        <div class="mb-3">
            <span class="text-sm font-medium text-brand-muted">คาดการณ์ผู้เข้าชมปี ${nextYear}</span>
            <div class="text-3xl font-bold text-brand-text tracking-wide mt-1">${Math.round(predictedY).toLocaleString()} <span class="text-base font-normal text-brand-muted">คน</span></div>
        </div>
        <div class="inline-flex items-center justify-center gap-2 ${bgLight} rounded-full py-1.5 px-4 mx-auto border">
            <span class="font-bold text-lg ${trendColor}">${arrow}</span>
            <span class="text-sm font-medium text-brand-text">${trendText} <span class="${trendColor} ml-1">${Math.abs(growthPercent).toFixed(1)}%</span></span>
        </div>
    `;
}

// ==========================================
// DASHBOARD QUICK INSIGHT
// ==========================================
function generateDashboardInsight(data, locationStats) {
    const insightTextEl = document.getElementById('dashboardInsightText');
    if (data.length === 0) {
        insightTextEl.innerHTML = '<span class="text-brand-danger">ไม่สามารถประมวลผลข้อมูลเชิงลึกได้</span>';
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

    insightTextEl.innerHTML = `จากการวิเคราะห์ภายใต้ตัวกรองปัจจุบัน พบว่า <strong class="text-brand-yellow">กลุ่ม ${topCluster}</strong> เป็นกลุ่มที่มีกำลังซื้อสูงสุด และ <strong class="text-brand-orange">${topLoc}</strong> เป็นพื้นที่ที่มีการกระจุกตัวของนักท่องเที่ยวหนาแน่นที่สุด`;
}

// ==========================================
// MAP & ATTRACTIONS LOGIC
// ==========================================
function updateMap(locationStats, totalMapVisitors) {
    if (!mapMarkersGroup) return;
    mapMarkersGroup.clearLayers();
    window.mapMarkers = {}; 

    const activeLocationsCount = Object.keys(locationStats).length;

    const summaryEl = document.getElementById('mapSummary');
    if (activeLocationsCount > 0) {
        summaryEl.innerHTML = `สถานที่: <span class="text-brand-orange">${activeLocationsCount}</span> แห่ง | ผู้เข้าชม: <span class="text-brand-orange">${totalMapVisitors.toLocaleString()}</span> คน`;
    } else {
        summaryEl.innerHTML = `<span class="text-brand-danger">ไม่มีข้อมูล</span>`;
    }

    Object.keys(locationStats).forEach(locName => {
        const meta = locationDictionary[locName];
        if (meta) {
            const stat = locationStats[locName];
            const avgSat = stat.count > 0 ? (stat.sumSat / stat.count).toFixed(1) : "0.0";
            
            // Sunset Orange glowing marker
            const markerIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${colors.sunset}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid ${colors.bg}; box-shadow: 0 0 10px ${colors.sunset};"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            const marker = L.marker([meta.lat, meta.lng], {icon: markerIcon});
            window.mapMarkers[locName] = marker;
            
            const imgHtml = meta.img 
                ? `<div style="height: 110px; overflow: hidden; border-radius: 6px 6px 0 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><img src="${meta.img}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;" alt="${locName}"></div>`
                : `<div style="height: 110px; background-color: ${colors.surfaceLight}; border-radius: 6px 6px 0 0; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: ${colors.orange}; font-weight: 600; font-size: 13px; text-align: center; padding: 10px; box-sizing: border-box;">${locName}</div>`;

            const popupContent = `
                <div style="width: 240px; background: transparent; color: ${colors.text}; font-family: 'Prompt', sans-serif;">
                    ${imgHtml}
                    <div style="padding: 12px;">
                        <h4 style="font-weight: 700; font-size: 14px; color: ${colors.warmGold}; margin: 0 0 4px 0; line-height: 1.3;">${locName}</h4>
                        <p style="font-size: 11px; color: ${colors.muted}; margin: 0 0 10px 0;">${meta.type}</p>
                        
                        <div style="font-size: 12px; margin-bottom: 12px; color: ${colors.text};">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 4px;">
                                <span style="color: ${colors.muted};">ผู้เข้าชม</span>
                                <span style="font-weight: 600; color: ${colors.primary};">${stat.visitors.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 4px;">
                                <span style="color: ${colors.muted};">รายได้</span>
                                <span style="font-weight: 600; color: ${colors.gold};">฿${stat.revenue.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: ${colors.muted};">ความพอใจ</span>
                                <span style="font-weight: 600; color: ${colors.twilight};">${avgSat}/5</span>
                            </div>
                        </div>

                        <button style="width: 100%; background-color: ${colors.surfaceLight}; color: ${colors.text}; border: 1px solid rgba(255,255,255,0.2); padding: 6px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                                onmouseover="this.style.backgroundColor='${colors.sunset}'; this.style.borderColor='${colors.sunset}';" onmouseout="this.style.backgroundColor='${colors.surfaceLight}'; this.style.borderColor='rgba(255,255,255,0.2)';"
                                onclick="openAttractionDetail('${locName}')">
                            ดูข้อมูลเชิงลึก
                        </button>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent, { minWidth: 240, maxWidth: 260, className: 'custom-dark-popup' });
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
            ? `<img src="${meta.img}" class="w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100" alt="${locName}">`
            : `<div class="w-full h-full bg-brand-surface-light flex items-center justify-center p-6 text-center border-b border-brand-border">
                 <span class="text-brand-orange font-bold text-lg opacity-80">${locName}</span>
               </div>`;

        const card = document.createElement('div');
        card.className = "bg-brand-surface rounded-2xl border border-brand-border overflow-hidden flex flex-col group hover:border-brand-orange transition-colors shadow-lg backdrop-blur-md";
        
        card.innerHTML = `
            <div class="h-40 overflow-hidden relative bg-brand-bg">
                <div class="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.8)] to-transparent z-10"></div>
                ${imgHtml}
            </div>
            <div class="p-5 flex-grow flex flex-col relative z-20 -mt-8">
                <h4 class="font-bold text-brand-yellow text-base leading-tight mb-2 line-clamp-2 drop-shadow-md" title="${locName}">${locName}</h4>
                <div class="text-xs text-brand-muted space-y-1.5 mb-4 flex-grow">
                    <p class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg> ${meta.district}</p>
                    <p class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> ${meta.type}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-x-2 gap-y-3 text-sm border-t border-brand-border pt-4 mb-5">
                    <div>
                        <span class="block text-xs text-brand-muted">ผู้เข้าชม</span>
                        <span class="font-bold text-brand-primary">${stat.visitors.toLocaleString()}</span>
                    </div>
                    <div>
                        <span class="block text-xs text-brand-muted">รายได้ (฿)</span>
                        <span class="font-bold text-brand-gold">${stat.revenue.toLocaleString()}</span>
                    </div>
                    <div class="col-span-2">
                        <span class="block text-xs text-brand-muted">ความพึงพอใจเฉลี่ย</span>
                        <div class="flex items-center gap-1">
                            <span class="font-bold text-brand-twilight">${avgSat}</span>
                            <span class="text-xs text-brand-muted">/ 5.0</span>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 mt-auto">
                    <button onclick="openAttractionDetail('${locName}')" class="bg-brand-surface-light border border-brand-border hover:bg-brand-primary text-brand-text text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center">
                        ข้อมูลเชิงลึก
                    </button>
                    <button onclick="focusOnMap('${locName}')" class="bg-brand-orange hover:bg-brand-yellow hover:text-brand-bg text-white text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center">
                        ระบุพิกัด
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
    const yearFilter = document.getElementById('filterYear').value;
    
    let stat = { vis: 0, rev: 0, sumSat: 0, count: 0 };
    rawData.forEach(row => {
        if (row.location === locName) {
            let passYear = yearFilter === 'all' ? true : row.year.toString() === yearFilter;
            let passFestival = festivalFilter === 'all' ? true : row.isFestival.toString() === festivalFilter;
            let passStyle = styleFilter === 'all' ? true : row.travelStyle === styleFilter;
            let passScore = true;
            if (scoreFilter === 'high') passScore = row.satisfaction >= 4.0;
            else if (scoreFilter === 'med') passScore = row.satisfaction >= 3.0 && row.satisfaction < 4.0;
            else if (scoreFilter === 'low') passScore = row.satisfaction < 3.0;
            
            if (passYear && passFestival && passStyle && passScore) {
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
    document.getElementById('modalRevenue').innerText = `${stat.rev.toLocaleString()}`;
    document.getElementById('modalSatisfaction').innerText = `${avgSat} / 5.0`;
    
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
    const dashboardRecs = document.getElementById('dashboardRecText');

    if (data.length === 0) {
        containerCards.innerHTML = '<div class="col-span-full text-brand-muted bg-brand-surface-light p-4 rounded border border-brand-border text-center">ไม่สามารถวิเคราะห์ข้อมูลได้ กรุณาปรับเปลี่ยนตัวกรอง</div>';
        containerRecs.innerHTML = '';
        if (dashboardRecs) dashboardRecs.innerHTML = 'ไม่สามารถสร้างข้อเสนอแนะได้';
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
    let dashboardRecFirst = ``;

    Object.keys(clusterStats).forEach((c, index) => {
        const stat = clusterStats[c];
        stat.arpu = stat.visitors > 0 ? (stat.revenue / stat.visitors) : 0;
        stat.avgSat = stat.count > 0 ? (stat.sumSat / stat.count) : 0;
        stat.pct = totalVis > 0 ? (stat.visitors / totalVis) * 100 : 0;

        let traitDescription = "";
        if (stat.arpu > avgSystemArpu) {
            traitDescription += "กลุ่มที่มีกำลังซื้อสูง (High Spender) ";
        } else {
            traitDescription += "กลุ่มเน้นความคุ้มค่า (Value Seeker) ";
        }
        if (stat.visitors > avgSystemVis) {
            traitDescription += "ตลาดหลัก (Mainstream)";
        } else {
            traitDescription += "ตลาดเฉพาะกลุ่ม (Niche)";
        }

        containerCards.innerHTML += `
            <div class="bg-brand-surface-light p-5 rounded-2xl border border-brand-border flex flex-col relative overflow-hidden group">
                <div class="absolute right-0 top-0 opacity-10 p-2 transform group-hover:scale-110 transition-transform duration-500">
                    <svg class="w-16 h-16 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h4 class="font-bold text-lg text-brand-orange mb-1 relative z-10">${c}</h4>
                <div class="text-xs text-brand-muted mb-4 border-b border-brand-border pb-3 relative z-10">ปริมาณข้อมูล: ${stat.visitors.toLocaleString()} คน (${stat.pct.toFixed(1)}%)</div>
                
                <div class="space-y-3 text-sm flex-grow relative z-10">
                    <div class="flex justify-between items-center">
                        <span class="text-brand-muted">รายได้เฉลี่ยต่อคน:</span>
                        <span class="font-semibold text-brand-gold">฿${Math.round(stat.arpu).toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-brand-muted">ความพึงพอใจเฉลี่ย:</span>
                        <span class="font-semibold text-brand-twilight">${stat.avgSat.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="text-xs text-brand-muted bg-brand-bg/50 p-3 rounded-xl mt-4 border border-brand-border relative z-10">
                    <span class="font-semibold text-brand-primary block mb-1">ลักษณะทางสถิติ:</span>
                    ${traitDescription}
                </div>
            </div>
        `;

        let action = "";
        
        if (stat.arpu > avgSystemArpu && stat.visitors <= avgSystemVis) {
            action = `กลุ่ม <strong>${c}</strong> มีรายได้ต่อคนสูง (<span class="text-brand-gold">฿${Math.round(stat.arpu).toLocaleString()}</span>) ควรจัดแคมเปญกระตุ้นยอดขายเพิ่มเติม`;
        } else if (stat.visitors > avgSystemVis && stat.avgSat < avgSystemSat) {
            action = `กลุ่ม <strong>${c}</strong> มีปริมาณสูง แต่ความพึงพอใจลดลง ควรตรวจสอบมาตรฐานบริการ`;
        } else if (stat.arpu > avgSystemArpu && stat.visitors > avgSystemVis) {
            action = `กลุ่ม <strong>${c}</strong> คือฐานลูกค้าหลัก ควรสร้าง Loyalty Program ต่อเนื่อง`;
        } else {
            action = `กลุ่ม <strong>${c}</strong> เหมาะสำหรับแพ็กเกจระยะสั้นเพื่อเติมเต็มช่วง Low Season`;
        }

        if (index === 0) dashboardRecFirst = action;

        recsHTML += `
            <div class="flex items-start gap-3 p-3 hover:bg-brand-surface-light rounded-xl transition-colors border-b border-brand-border last:border-0">
                <svg class="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-sm text-brand-text leading-relaxed">${action}</p>
            </div>
        `;
    });

    containerRecs.innerHTML = recsHTML;
    if (dashboardRecs) dashboardRecs.innerHTML = dashboardRecFirst;
    
    drawDssScatterChart(data);
}

function drawDssScatterChart(data) {
    const ctx = document.getElementById('dssScatterChart').getContext('2d');
    
    // Matches the sunset colors
    const clusterColors = {
        "Family Chill-Out": "rgba(249, 115, 22, 0.8)",  // Sunset Orange
        "Solo Explorer": "rgba(96, 165, 250, 0.8)",     // Sky Blue
        "Festival Spenders": "rgba(192, 132, 252, 0.8)" // Twilight Purple
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
            backgroundColor: clusterColors[clusterName] || colors.muted,
            borderColor: clusterColors[clusterName] ? clusterColors[clusterName].replace('0.8', '1') : colors.muted,
            borderWidth: 1,
            pointRadius: (ctx) => {
                let v = ctx.raw ? ctx.raw.visitors : 10;
                return Math.max(4, Math.min(22, v / 12));
            },
            pointHoverRadius: 10
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
                x: { 
                    title: { display: true, text: 'คะแนนความพึงพอใจ (Satisfaction)', color: colors.muted }, 
                    min: 1, max: 5,
                    grid: { color: colors.border, borderDash: [5, 5] },
                    ticks: { color: colors.muted }
                },
                y: { 
                    title: { display: true, text: 'รายได้เฉลี่ยต่อคน (ARPU)', color: colors.muted }, 
                    beginAtZero: true,
                    grid: { color: colors.border, borderDash: [5, 5] },
                    ticks: { color: colors.muted }
                }
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: colors.orange,
                    bodyColor: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (ctx) => ` ${ctx.raw.location} | พอใจ: ${ctx.raw.x} | ARPU: ฿${Math.round(ctx.raw.y)}`
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, boxWidth: 8, color: colors.text }
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
        document.getElementById('kpiRevenue').innerText = "0";
        document.getElementById('kpiVisitors').innerText = "0";
        document.getElementById('kpiArpu').innerText = "0";
        document.getElementById('kpiSatisfaction').innerText = "0.0";
        return;
    }
    const totalRev = data.reduce((sum, row) => sum + row.revenue, 0);
    const totalVis = data.reduce((sum, row) => sum + row.visitors, 0);
    const avgSat = data.reduce((sum, row) => sum + row.satisfaction, 0) / data.length;
    const arpu = totalVis > 0 ? totalRev / totalVis : 0;

    document.getElementById('kpiRevenue').innerHTML = totalRev.toLocaleString() + ' <span class="text-sm font-normal text-brand-muted">บาท</span>';
    document.getElementById('kpiVisitors').innerHTML = totalVis.toLocaleString() + ' <span class="text-sm font-normal text-brand-muted">คน</span>';
    document.getElementById('kpiArpu').innerHTML = arpu.toLocaleString(undefined, {maximumFractionDigits:0}) + ' <span class="text-sm font-normal text-brand-muted">บาท</span>';
    document.getElementById('kpiSatisfaction').innerHTML = avgSat.toFixed(2) + ' <span class="text-sm font-normal text-brand-muted">/ 5.0</span>';
}

function drawVisitorChart(data) {
    const ctx = document.getElementById('visitorChart').getContext('2d');
    const monthsOrder = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
    
    const yearsPresent = [...new Set(data.map(d => d.year))].sort();
    const datasets = [];
    
    // Assigning vibrant sunset colors to different years
    const yearThemeColors = {
        2024: colors.sunset,      // Orange for latest
        2023: colors.gold,        // Gold for mid
        2022: colors.twilight     // Purple for oldest
    };

    yearsPresent.forEach(yr => {
        const visitorsByMonth = {};
        monthsOrder.forEach(m => visitorsByMonth[m] = 0);
        
        data.filter(d => d.year === yr).forEach(row => { 
            visitorsByMonth[row.month] += row.visitors; 
        });
        
        const isSingleYear = yearsPresent.length === 1;
        const color = yearThemeColors[yr] || colors.muted;

        datasets.push({
            label: `ปี ${yr}`,
            data: monthsOrder.map(m => visitorsByMonth[m]),
            borderColor: color,
            backgroundColor: isSingleYear ? color.replace('rgb', 'rgba').replace(')', ', 0.15)') : 'transparent',
            borderWidth: 2.5,
            tension: 0.4, 
            fill: isSingleYear,
            pointBackgroundColor: colors.bg,
            pointBorderColor: color,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7
        });
    });

    if (visitorChartInstance) visitorChartInstance.destroy();
    visitorChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: monthsOrder, datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                y: { beginAtZero: true, grid: { color: colors.border, borderDash: [5, 5] }, ticks: { color: colors.muted } },
                x: { grid: { display: false }, ticks: { color: colors.muted } }
            },
            plugins: {
                legend: { display: true, position: 'top', align: 'end', labels: { color: colors.text } },
                tooltip: { 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: colors.orange,
                    bodyColor: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1 
                }
            }
        }
    });
}

function drawRevenueChart(data) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const revenueByLocation = {};
    data.forEach(row => { revenueByLocation[row.location] = (revenueByLocation[row.location] || 0) + row.revenue; });
    
    const sortedEntries = Object.entries(revenueByLocation).sort((a, b) => b[1] - a[1]);
    const labels = sortedEntries.map(e => e[0]);
    const values = sortedEntries.map(e => e[1]);

    if (revenueChartInstance) revenueChartInstance.destroy();
    
    // Create a beautiful gradient for the bars
    let gradient = ctx.createLinearGradient(0, 0, 400, 0);
    gradient.addColorStop(0, colors.twilight);
    gradient.addColorStop(0.5, colors.sunset);
    gradient.addColorStop(1, colors.warmGold);

    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: labels, 
            datasets: [{ 
                label: 'รายได้ชุมชน (บาท)', 
                data: values, 
                backgroundColor: gradient, 
                borderRadius: 6,
                barThickness: 'flex',
                maxBarThickness: 30
            }] 
        },
        options: { 
            indexAxis: 'y',
            responsive: true, 
            maintainAspectRatio: false,
            scales: { 
                x: { beginAtZero: true, grid: { color: colors.border, borderDash: [5, 5] }, ticks: { color: colors.muted } },
                y: { grid: { display: false }, ticks: { font: { size: 11 }, color: colors.text } }
            },
            plugins: {
                legend: { display: false },
                tooltip: { 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: colors.warmGold,
                    bodyColor: colors.text,
                    borderColor: colors.border,
                    borderWidth: 1 
                }
            }
        }
    });
}

initDashboard();
