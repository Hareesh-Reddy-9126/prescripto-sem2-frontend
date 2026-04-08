import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`browser:${msg.type()}:`, msg.text());
  });

  page.on('pageerror', err => {
    console.error('pageerror:', err);
  });

  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 15000 });
    const content = await page.content();
    console.log('rendered content length:', content.length);
  } catch (error) {
    console.error('navigation error:', error);
  } finally {
    await browser.close();
  }
})();
