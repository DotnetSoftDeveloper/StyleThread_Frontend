import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5176';

const VIEWPORTS = [
  { name: 'Mobile (375x812)', width: 375, height: 812 },
  { name: 'Tablet (768x1024)', width: 768, height: 1024 },
  { name: 'Laptop (1366x768)', width: 1366, height: 768 },
  { name: 'Desktop (1920x1080)', width: 1920, height: 1080 }
];

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    totalPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    totalFailed++;
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log(' STARTING DUKAANONLINE MULTI-VIEWPORT & REGRESSION SUITE');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n>>> Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) <<<`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        ignoreHTTPSErrors: true
      });
      const page = await context.newPage();

      // -------------------------------------------------------------
      // 1. PUBLIC LANDING PAGE
      // -------------------------------------------------------------
      console.log('\n--- 1. Testing Public Landing Page (/) ---');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // Check for zero page horizontal overflow
      const publicScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const publicClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert(publicScrollWidth <= publicClientWidth + 1, `Zero page horizontal overflow: scrollWidth (${publicScrollWidth}) <= clientWidth (${publicClientWidth})`);

      // Check navigation leaks
      const links = await page.$$eval('a', els => els.map(a => ({ href: a.getAttribute('href') || '', text: a.innerText })));
      const hasSuperAdminLink = links.some(l => l.href.includes('/super-admin') || l.text.toLowerCase().includes('super admin'));
      const hasAdminDashboardLeak = links.some(l => l.href === '/admin/dashboard' || l.href.startsWith('/admin/products'));
      const hasMerchantSignIn = links.some(l => l.href === '/admin/login' || l.text.includes('Merchant Sign In') || l.text.includes('Sign In'));

      assert(!hasSuperAdminLink, 'No Super Admin links found on public site');
      assert(!hasAdminDashboardLeak, 'No Store Admin Dashboard leaks found on public site');
      assert(hasMerchantSignIn, 'Merchant Sign In CTA is present on public site');

      // -------------------------------------------------------------
      // 2. CLIENT STOREFRONT (urban-threads)
      // -------------------------------------------------------------
      console.log('\n--- 2. Testing Client Storefront (/store/urban-threads) ---');
      await page.goto(`${BASE_URL}/store/urban-threads`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const sfScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const sfClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert(sfScrollWidth <= sfClientWidth + 1, `Storefront horizontal overflow: scrollWidth (${sfScrollWidth}) <= clientWidth (${sfClientWidth})`);

      // Verify customer navigation only (no merchant tabs)
      const sfLinks = await page.$$eval('a', els => els.map(a => ({ href: a.getAttribute('href') || '', text: a.innerText.trim() })));
      const hasMerchantProductsTab = sfLinks.some(l => l.text === 'Products' && l.href.includes('/store/urban-threads/productList'));
      const hasMerchantOrdersTab = sfLinks.some(l => l.text === 'Orders' && (l.href.includes('/store/urban-threads/orders') || l.href === '/seller/orders'));
      const hasMerchantAnalyticsTab = sfLinks.some(l => l.text === 'Analytics' && l.href.includes('analytics'));
      const hasAdminConsole = sfLinks.some(l => l.text.includes('Admin Console'));

      assert(!hasMerchantProductsTab, 'No merchant "Products" operation link in storefront navbar');
      assert(!hasMerchantOrdersTab, 'No merchant "Orders" operation link in storefront navbar');
      assert(!hasMerchantAnalyticsTab, 'No merchant "Analytics" operation link in storefront navbar');
      assert(!hasAdminConsole, 'No "Admin Console" link in customer navbar');

      // Check dynamic navbar offset CSS variable
      const navbarHeightVar = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--navbar-height');
      });
      assert(navbarHeightVar && parseInt(navbarHeightVar) > 0, `Dynamic --navbar-height CSS variable is active: ${navbarHeightVar.trim()}`);

      // -------------------------------------------------------------
      // 3. 404 NOT FOUND PAGE
      // -------------------------------------------------------------
      console.log('\n--- 3. Testing 404 Page Navigation ---');
      await page.goto(`${BASE_URL}/random-non-existent-page-url`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const notFoundScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const notFoundClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      assert(notFoundScrollWidth <= notFoundClientWidth + 1, `404 page horizontal overflow: scrollWidth (${notFoundScrollWidth}) <= clientWidth (${notFoundClientWidth})`);

      const returnBtn = await page.$('.noContent-btn--primary');
      assert(returnBtn !== null, '404 return button is present and role-aware');

      await context.close();
    }

    // -------------------------------------------------------------
    // 4. SUPER ADMIN PORTAL - ALL PAGES ACROSS ALL 4 VIEWPORTS
    // -------------------------------------------------------------
    console.log('\n>>> Testing Super Admin Portal & Tables Across All Viewports <<<');
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Super Admin Portal on ${vp.name} ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        ignoreHTTPSErrors: true
      });
      const page = await context.newPage();

      // Go to Super Admin Login
      await page.goto(`${BASE_URL}/super-admin/login`, { waitUntil: 'domcontentloaded' });
      await page.fill('input[type="email"]', 'superadmin@platform.com');
      await page.fill('input[type="password"]', 'Admin@123');
      await page.click('button[type="submit"]');

      // Wait for navigation to dashboard
      await page.waitForURL('**/super-admin/dashboard', { timeout: 10000 });
      assert(page.url().includes('/super-admin/dashboard'), `[${vp.name}] Super Admin logged in to Dashboard`);

      const saPages = [
        { path: '/super-admin/dashboard', name: 'Dashboard' },
        { path: '/super-admin/applications', name: 'Applications Queue' },
        { path: '/super-admin/stores', name: 'Stores Directory' },
        { path: '/super-admin/admins', name: 'Admins Directory' },
        { path: '/super-admin/store-assignments', name: 'Store Assignments' },
        { path: '/super-admin/audit-logs', name: 'Audit Logs' }
      ];

      for (const saPage of saPages) {
        await page.goto(`${BASE_URL}${saPage.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(400);

        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientW = await page.evaluate(() => document.documentElement.clientWidth);
        assert(scrollW <= clientW + 1, `[${vp.name}] ${saPage.name} no page horizontal overflow: scrollWidth (${scrollW}) <= clientWidth (${clientW})`);
      }

      await context.close();
    }

    // -------------------------------------------------------------
    // 5. STORE ADMIN PORTAL - ALL PAGES ACROSS ALL 4 VIEWPORTS
    // -------------------------------------------------------------
    console.log('\n>>> Testing Store Admin Portal & Tables Across All Viewports <<<');
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Store Admin Portal on ${vp.name} ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        ignoreHTTPSErrors: true
      });
      const page = await context.newPage();

      // Go to Store Admin Login
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
      await page.fill('input[type="email"]', 'admin@urbanthreads.com');
      await page.fill('input[type="password"]', 'Admin@123');
      await page.click('button[type="submit"]');

      // Wait for navigation to dashboard
      await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
      assert(page.url().includes('/admin/dashboard'), `[${vp.name}] Store Admin logged in to Dashboard`);

      const storeAdminPages = [
        { path: '/admin/dashboard', name: 'Store Dashboard' },
        { path: '/admin/products', name: 'Product Catalog' },
        { path: '/admin/products/new', name: 'Add Product Form' },
        { path: '/admin/categories', name: 'Categories' },
        { path: '/admin/inventory', name: 'Inventory Health' },
        { path: '/admin/orders', name: 'Orders Management' },
        { path: '/admin/customers', name: 'Customers Directory' },
        { path: '/admin/analytics', name: 'Sales Analytics' }
      ];

      for (const stPage of storeAdminPages) {
        await page.goto(`${BASE_URL}${stPage.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(400);

        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientW = await page.evaluate(() => document.documentElement.clientWidth);
        assert(scrollW <= clientW + 1, `[${vp.name}] ${stPage.name} no page horizontal overflow: scrollWidth (${scrollW}) <= clientWidth (${clientW})`);
      }

      // Verify Add Product button routing on Product Catalog
      await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'domcontentloaded' });
      const addBtnLink = await page.$eval('a.btn-sa-primary', a => a.getAttribute('href'));
      assert(addBtnLink === '/admin/products/new', `[${vp.name}] Add Product button routes to internal /admin/products/new`);

      // Verify Add Product page back button returns to /admin/products
      await page.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'domcontentloaded' });
      const cancelBtn = await page.$('.btn-cancel');
      if (cancelBtn) {
        await cancelBtn.click();
        await page.waitForURL('**/admin/products', { timeout: 5000 });
        assert(page.url().includes('/admin/products'), `[${vp.name}] Cancel in Add Product returns cleanly to /admin/products`);
      }

      await context.close();
    }

    // -------------------------------------------------------------
    // 6. LEGACY ROUTE REDIRECTS
    // -------------------------------------------------------------
    console.log('\n>>> Testing Legacy Redirects <<<');
    const redirectContext = await browser.newContext();
    const redirectPage = await redirectContext.newPage();

    // Check /productList redirects to /admin/products or /admin/login
    await redirectPage.goto(`${BASE_URL}/productList`, { waitUntil: 'domcontentloaded' });
    await redirectPage.waitForTimeout(500);
    const productListTarget = redirectPage.url();
    assert(productListTarget.includes('/admin/'), `Legacy /productList redirects to admin portal: ${productListTarget}`);

    // Check /seller/orders redirects to /admin/orders or /admin/login
    await redirectPage.goto(`${BASE_URL}/seller/orders`, { waitUntil: 'domcontentloaded' });
    await redirectPage.waitForTimeout(500);
    const sellerOrdersTarget = redirectPage.url();
    assert(sellerOrdersTarget.includes('/admin/'), `Legacy /seller/orders redirects to admin portal: ${sellerOrdersTarget}`);

    await redirectContext.close();

  } catch (err) {
    console.error('Test execution error:', err);
    totalFailed++;
  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log(` TEST RESULTS SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('===============================================================');

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
