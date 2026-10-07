const fs = require('fs');

const locations = [
    "ลานพญาศรีสัตตนาคราช", "วัดพระธาตุพนมวรมหาวิหาร", "ถนนคนเดินนครพนม",
    "ชุมชนไทญ้อ", "วัดนักบุญอันนา หนองแสง",
    "บ้านลุงโฮจิมินห์ (บ้านนาจอก)", "พิพิธภัณฑ์จวนผู้ว่าราชการจังหวัดนครพนม (หลังเก่า)",
    "เส้นทางจักรยานริมแม่น้ำโขง (River Walk)", "อุทยานแห่งชาติภูลังกา", "วัดพระธาตุเรณู"
];

const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const travelStyles = ["ลุยเดี่ยว", "กลุ่มเพื่อน", "ครอบครัว"];
const years = [2022, 2023, 2024];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max) { return (Math.random() * (max - min) + min).toFixed(1); }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const data = [];
let id = 1;

for (let i = 0; i < 1500; i++) {
    const year = randomChoice(years);
    const month = randomChoice(months);
    const location = randomChoice(locations);
    const style = randomChoice(travelStyles);

    let isFestival = (month === "เมษายน" || month === "ตุลาคม" || month === "ธันวาคม");
    if (Math.random() > 0.8) isFestival = !isFestival;

    let cluster = "Family Chill-Out";
    if (style === "ลุยเดี่ยว") cluster = "Solo Explorer";
    if (isFestival && Math.random() > 0.5) cluster = "Festival Spenders";

    // Base metrics
    let visitors = randomInt(50, 300);
    let revenue = visitors * randomInt(500, 2000);
    let satisfaction = parseFloat(randomFloat(3.0, 5.0));

    // Year multiplier (Trend growth) - simulating a general tourism recovery/growth
    let yearMult = 1.0;
    if (year === 2023) yearMult = randomFloat(1.05, 1.15); // ~10% growth
    if (year === 2024) yearMult = randomFloat(1.15, 1.30); // ~22% growth

    visitors = Math.floor(visitors * yearMult);
    revenue = Math.floor(revenue * yearMult);

    // Adjustments based on cluster
    if (cluster === "Festival Spenders") { visitors *= 1.5; revenue *= 1.8; satisfaction -= 0.5; }
    if (cluster === "Family Chill-Out") { revenue *= 1.2; satisfaction += 0.2; }
    if (cluster === "Solo Explorer") { visitors = Math.floor(visitors * 0.6); revenue = Math.floor(revenue * 0.5); }

    satisfaction = Math.max(1.0, Math.min(5.0, satisfaction));

    const reviews = [
        "ประทับใจมาก แนะนำเลยครับ", "คนเยอะไปหน่อยแต่ก็สนุกดี", "บรรยากาศดี ถ่ายรูปสวย",
        "การจัดการยังต้องปรับปรุงนิดหน่อย", "คุ้มค่ากับการมาเที่ยว", "ของกินอร่อย วิวสวยมาก",
        "อากาศร้อนไปนิด แต่โดยรวมโอเค", "เหมาะกับการมาพักผ่อนจริงๆ"
    ];

    data.push({
        id: id++,
        year: year,
        month: month,
        location: location,
        travelStyle: style,
        isFestival: isFestival,
        cluster: cluster,
        visitors: Math.floor(visitors),
        revenue: Math.floor(revenue),
        satisfaction: parseFloat(satisfaction.toFixed(1)),
        review: randomChoice(reviews)
    });
}

fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log('Generated 1500 records spanning 3 years successfully!');
