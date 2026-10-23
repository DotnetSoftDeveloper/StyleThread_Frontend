import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

  // 1. Super Admin
  await page.goto('http://localhost:5176/super-admin/login');
  await page.fill('input[type="email"]', 'superadmin@platform.com');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/super-admin/dashboard');

  await page.goto('http://localhost:5176/super-admin/applications');
  await page.waitForTimeout(600);

  const saOverflows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(el => el.getBoundingClientRect().right > window.innerWidth || el.scrollWidth > window.innerWidth)
      .map(el => ({
        tag: el.tagName,
        class: typeof el.className === 'string' ? el.className : '',
        id: el.id,
        right: el.getBoundingClientRect().right,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
      }))
      .slice(0, 15);
  });
  console.log('Super Admin applications overflows:', JSON.stringify(saOverflows, null, 2));

  // 2. Store Admin
  await page.goto('http://localhost:5176/admin/login');
  await page.fill('input[type="email"]', 'admin@urbanthreads.com');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard');

  await page.goto('http://localhost:5176/admin/products');
  await page.waitForTimeout(600);

  const adminOverflows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .filter(el => el.getBoundingClientRect().right > window.innerWidth || el.scrollWidth > window.innerWidth)
      .map(el => ({
        tag: el.tagName,
        class: typeof el.className === 'string' ? el.className : '',
        id: el.id,
        right: el.getBoundingClientRect().right,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
      }))
      .slice(0, 15);
  });
  console.log('Store Admin products overflows:', JSON.stringify(adminOverflows, null, 2));

  await browser.close();
}

check();
