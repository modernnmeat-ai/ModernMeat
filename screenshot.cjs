const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 713 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'home-mobile.png', fullPage: true });
  await page.goto('http://localhost:5173/market', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'market-mobile.png', fullPage: true });
  await browser.close();
})();
