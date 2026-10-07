const https = require('https');

const titles = [
    "วัดพระธาตุพนมวรมหาวิหาร",
    "อุทยานแห่งชาติภูลังกา",
    "วัดนักบุญอันนา หนองแสง",
    "พิพิธภัณฑ์จวนผู้ว่าราชการจังหวัดนครพนม"
];

async function getWikiImage(title) {
    return new Promise((resolve) => {
        const url = `https://th.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
        const options = {
            headers: { 'User-Agent': 'TourismDSS/1.0 (wachirawitpr68)' }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId].thumbnail) resolve(pages[pageId].thumbnail.source);
                    else resolve("");
                } catch (e) { resolve(""); }
            });
        }).on('error', () => resolve(""));
    });
}

async function run() {
    for (const t of titles) {
        console.log(t + " : " + await getWikiImage(t));
    }
}
run();
