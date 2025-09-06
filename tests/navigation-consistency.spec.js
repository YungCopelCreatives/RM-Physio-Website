const { test, expect } = require('@playwright/test');

test.describe('Navigation Consistency Tests', () => {
  const pages = [
    '/',
    '/about.html',
    '/services.html',
    '/conditions/index.html',
    '/blog/index.html',
    '/contact.html',
    '/faq.html'
  ];

  test('Navigation menu is consistent across all pages', async ({ page }) => {
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');

      // Check main navigation items
      const navLinks = [
        { selector: 'a[href="/"]', text: 'Home' },
        { selector: 'a[href="/about.html"]', text: 'About' },
        { selector: 'a[href="/services.html"]', text: 'Services' },
        { selector: 'a[href="/conditions/"]', text: 'Conditions' },
        { selector: 'a[href="/blog/"]', text: 'Blog' },
        { selector: 'a[href="/contact.html"]', text: 'Contact' }
      ];

      for (const link of navLinks) {
        const navLink = page.locator(`.nav-menu ${link.selector}`);
        await expect(navLink).toBeVisible();
        await expect(navLink).toContainText(link.text);
      }

      // Check Book Appointment button
      const bookingBtn = page.locator('.nav-menu a[href="/appointments.html"]');
      await expect(bookingBtn).toBeVisible();
      await expect(bookingBtn).toContainText('Book Appointment');
      await expect(bookingBtn).toHaveClass(/btn btn-primary/);
    }
  });

  test('Conditions dropdown contains all 11 condition pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hover over Conditions to show dropdown
    const conditionsNav = page.locator('.nav-item.dropdown').filter({ hasText: 'Conditions' });
    await conditionsNav.hover();

    const dropdownMenu = conditionsNav.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    // Check all condition links
    const expectedConditions = [
      'Back Pain',
      'Neck Pain', 
      'Sciatica',
      'Plantar Fasciitis',
      'Achilles Tendinopathy',
      'Arthritis',
      'Headaches & TMJ',
      'Post-Op Rehab',
      'Balance & Mobility',
      'COPD & Bronchitis',
      'Paediatric Chest Physio'
    ];

    for (const condition of expectedConditions) {
      const conditionLink = dropdownMenu.locator('a').filter({ hasText: condition });
      await expect(conditionLink).toBeVisible();
    }
  });

  test('Services dropdown contains all service categories', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hover over Services to show dropdown
    const servicesNav = page.locator('.nav-item.dropdown').filter({ hasText: 'Services' });
    await servicesNav.hover();

    const dropdownMenu = servicesNav.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    // Check service links
    const expectedServices = [
      'Sports & Running Rehab',
      'Musculoskeletal & Orthopaedic',
      'Neurological Rehab',
      'Chest Physiotherapy',
      'Corporate Wellness',
      'Home Visit Services'
    ];

    for (const service of expectedServices) {
      const serviceLink = dropdownMenu.locator('a').filter({ hasText: service });
      await expect(serviceLink).toBeVisible();
    }
  });

  test('Mobile navigation works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Mobile menu should be initially hidden
    const navMenu = page.locator('.nav-menu');
    await expect(navMenu).not.toBeVisible();

    // Mobile toggle button should be visible
    const mobileToggle = page.locator('.mobile-menu-toggle');
    await expect(mobileToggle).toBeVisible();

    // Click mobile toggle to open menu
    await mobileToggle.click();
    await page.waitForTimeout(300); // Wait for menu animation

    // Nav menu should now be visible
    await expect(navMenu).toBeVisible();

    // Check that navigation links work in mobile
    const homeLink = navMenu.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('Font Awesome icons are properly loaded', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that Font Awesome CSS is loaded
    const fontAwesomeLink = page.locator('link[href*="font-awesome"]');
    await expect(fontAwesomeLink).toBeAttached();

    // Check social media icons in footer
    const socialIcons = page.locator('.social-icon i');
    await expect(socialIcons).toHaveCount(4); // Facebook, Instagram, LinkedIn, Twitter

    // Verify specific Font Awesome classes
    const facebookIcon = page.locator('.social-icon i.fa-facebook-f');
    const instagramIcon = page.locator('.social-icon i.fa-instagram');
    const linkedinIcon = page.locator('.social-icon i.fa-linkedin-in');
    const twitterIcon = page.locator('.social-icon i.fa-twitter');

    await expect(facebookIcon).toBeVisible();
    await expect(instagramIcon).toBeVisible();
    await expect(linkedinIcon).toBeVisible();
    await expect(twitterIcon).toBeVisible();
  });
});