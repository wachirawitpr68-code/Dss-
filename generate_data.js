const fs = require('fs');

const locations = [
    "วัดพระธาตุพนมวรมหาวิหาร", 
    "ลานพญาศรีสัตตนาคราช", 
    "ถนนคนเดินนครพนม", 
    "ชุมชนไทญ้อ",
    "วัดนักบุญอันนา หนองแสง",
    "หอนาฬิกาเวียดนามอนุสรณ์",
    "บ้านลุงโฮจิมินห์ (บ้านนาจอก)",
    "พิพิธภัณฑ์จวนผู้ว่าราชการจังหวัดนครพนม (หลังเก่า)",
    "เส้นทางจักรยานริมแม่น้ำโขง (River Walk)",
    "อุทยานแห่งชาติภูลังกา",
    "วัดพระธาตุเรณู"
];
const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const styles = ["ลุยเดี่ยว", "กลุ่มเพื่อน", "ครอบครัว"];

const reviewsGood = ["บรรยากาศดีมาก", "ประทับใจสุดๆ", "วิวสวยมาก", "ของกินอร่อย", "มานครพนมต้องมาที่นี่", "คนเยอะแต่สนุกดี", "สถานที่ศักดิ์สิทธิ์และเงียบสงบ", "เหมาะกับการมาพักผ่อน", "มุมถ่ายรูปเยอะมาก", "เดินทางสะดวก", "ประทับใจวิถีชุมชน"];
const reviewsMed = ["พอใช้ได้", "คนเยอะไปหน่อย", "อากาศร้อนมาก", "หาที่จอดรถยาก", "ราคาอาหารแอบแพง", "ของขายซ้ำๆ กันเยอะ", "โอเคระดับนึง", "ไม่มีอะไรพิเศษ", "รอคิวนาน"];
const reviewsBad = ["สกปรกไปนิด", "ห้องน้ำไม่พอ", "จัดระเบียบแย่มาก", "วุ่นวายสุดๆ", "ไม่ประทับใจเลย", "รถติดมาก", "ของแพงเกินจริง"];

const data = [];

for (let i = 1; i <= 500; i++) {
    const month = months[Math.floor(Math.random() * months.length)];
    const isFestMonth = (month === "เมษายน" || month === "ตุลาคม" || month === "พฤศจิกายน" || month === "ธันวาคม");
    const isFestival = isFestMonth ? (Math.random() > 0.4) : (Math.random() > 0.85);
    
    const travelStyle = styles[Math.floor(Math.random() * styles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    let visitors = 1;
    if (travelStyle === "ครอบครัว") visitors = Math.floor(Math.random() * 6) + 3;
    else if (travelStyle === "กลุ่มเพื่อน") visitors = Math.floor(Math.random() * 5) + 2;
    else visitors = 1;

    let cluster = "";
    let satisfaction = 0;
    let revenuePerHead = 0;

    if (isFestival && Math.random() > 0.3) {
        cluster = "Festival Spenders";
        revenuePerHead = Math.floor(Math.random() * 2500) + 1500;
        satisfaction = (Math.random() * 2.5) + 2.0;
    } else if (travelStyle === "ครอบครัว") {
        cluster = "Family Chill-Out";
        revenuePerHead = Math.floor(Math.random() * 1500) + 800;
        satisfaction = (Math.random() * 1.5) + 3.5;
    } else {
        cluster = "Solo Explorer";
        revenuePerHead = Math.floor(Math.random() * 1000) + 400;
        satisfaction = (Math.random() * 2.0) + 3.0;
    }

    const totalRevenue = visitors * revenuePerHead;
    
    let review = "";
    if (satisfaction >= 4.0) review = reviewsGood[Math.floor(Math.random() * reviewsGood.length)];
    else if (satisfaction >= 3.0) review = reviewsMed[Math.floor(Math.random() * reviewsMed.length)];
    else review = reviewsBad[Math.floor(Math.random() * reviewsBad.length)];

    data.push({
        id: i,
        month: month,
        isFestival: isFestival,
        travelStyle: travelStyle,
        location: location,
        visitors: visitors,
        revenue: totalRevenue,
        satisfaction: parseFloat(satisfaction.toFixed(1)),
        cluster: cluster,
        review: review
    });
}

fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Regenerated data.json with 11 locations.');
