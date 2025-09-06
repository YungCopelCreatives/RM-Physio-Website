const { test, expect } = require('@playwright/test');

test.describe('Responsive Layout Tests', () => {
  const viewports = [
    { name: 'Desktop', width: 1200, height: 800 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`Service cards display properly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/services.html');
      await page.waitForLoadState('networkidle');

      const serviceCards = page.locator('.service-card');
      await expect(serviceCards.first()).toBeVisible();

      // Check that cards are properly stacked on smaller screens
      if (width < 768) {
        // On mobile, cards should stack vertically
        const servicesGrid = page.locator('.services-grid');
        const gridColumns = await servicesGrid.evaluate(el => 
          getComputedStyle(el).gridTemplateColumns
        );
        // Should be single column on mobile
        expect(gridColumns).toBe('1fr');
      }

      // Expand first card to test mobile interaction
      const firstCard = serviceCards.first();
      const firstHeader = firstCard.locator('.service-header');
      await firstHeader.click();
      await page.waitForTimeout(500);

      await expect(firstCard).toHaveClass(/expanded/);
    });

    test(`Navigation works correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      if (width < 768) {
        // Mobile navigation
        const mobileToggle = page.locator('.mobile-menu-toggle');
        await expect(mobileToggle).toBeVisible();

        // Menu should be initially hidden
        const navMenu = page.locator('.nav-menu');
        const isVisible = await navMenu.isVisible();
        expect(isVisible).toBe(false);

        // Click to open menu
        await mobileToggle.click();
        await page.waitForTimeout(300);

        // Menu should now be visible
        await expect(navMenu).toBeVisible();
      } else {
        // Desktop/tablet navigation
        const navMenu = page.locator('.nav-menu');
        await expect(navMenu).toBeVisible();

        // Test dropdown hover on desktop
        if (width >= 768) {
          const conditionsDropdown = page.locator('.nav-item.dropdown').filter({ hasText: 'Conditions' });
          await conditionsDropdown.hover();
          
          const dropdownMenu = conditionsDropdown.locator('.dropdown-menu');
          await expect(dropdownMenu).toBeVisible();
        }
      }
    });

    test(`Booking section displays properly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.locator('#booking').scrollIntoViewIfNeeded();

      const bookingCards = page.locator('.booking-card');
      await expect(bookingCards.first()).toBeVisible();

      if (width < 768) {
        // On mobile, booking cards should stack
        const bookingOptions = page.locator('.booking-options');
        const gridColumns = await bookingOptions.evaluate(el => 
          getComputedStyle(el).gridTemplateColumns
        );
        expect(gridColumns).toBe('1fr');
      }

      // Test form interaction
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test User');
        const value = await nameInput.inputValue();
        expect(value).toBe('Test User');
      }
    });

    test(`Conditions grid adapts to ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/conditions/index.html');
      await page.waitForLoadState('networkidle');

      const conditionsGrid = page.locator('.conditions-grid');
      const conditionCards = page.locator('.condition-card');

      await expect(conditionsGrid).toBeVisible();
      await expect(conditionCards.first()).toBeVisible();

      // Check grid adaptation
      const gridColumns = await conditionsGrid.evaluate(el => 
        getComputedStyle(el).gridTemplateColumns
      );

      if (width >= 1200) {
        // Desktop: Should have multiple columns
        expect(gridColumns).not.toBe('1fr');
      } else if (width < 768) {
        // Mobile: Should be single column
        expect(gridColumns).toBe('1fr');
      }
    });

    test(`Footer displays properly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Scroll to footer
      await page.locator('footer').scrollIntoViewIfNeeded();

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Check social media icons
      const socialIcons = page.locator('.social-icon');
      await expect(socialIcons.first()).toBeVisible();

      // Check newsletter section
      const newsletter = page.locator('footer').locator('text=Newsletter');
      if (await newsletter.count() > 0) {
        await expect(newsletter).toBeVisible();
      }

      // Check contact information
      const contactInfo = page.locator('footer').locator('text=Location');
      if (await contactInfo.count() > 0) {
        await expect(contactInfo).toBeVisible();
      }
    });
  });

  test('Cookie banner adapts to mobile screens', async ({ page }) => {
    await page.context().clearCookies();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cookieBanner = page.locator('.cookie-banner');
    await expect(cookieBanner).toBeVisible();

    // Check that buttons are properly sized for mobile
    const acceptBtn = cookieBanner.locator('.cookie-accept');
    const declineBtn = cookieBanner.locator('.cookie-decline');

    await expect(acceptBtn).toBeVisible();
    if (await declineBtn.count() > 0) {
      await expect(declineBtn).toBeVisible();
    }

    // Banner should not overflow on mobile
    const bannerWidth = await cookieBanner.evaluate(el => el.offsetWidth);
    expect(bannerWidth).toBeLessThanOrEqual(375);
  });

  test('Text remains readable across all viewport sizes', async ({ page }) => {
    for (const { name, width, height } of viewports) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check hero section text
      const heroTitle = page.locator('.hero h1').first();
      if (await heroTitle.count() > 0) {
        await expect(heroTitle).toBeVisible();
        
        // Font size should be appropriate for viewport
        const fontSize = await heroTitle.evaluate(el => 
          parseInt(getComputedStyle(el).fontSize)
        );
        
        if (width < 768) {
          expect(fontSize).toBeGreaterThan(20); // Minimum readable size on mobile
        } else {
          expect(fontSize).toBeGreaterThan(24); // Larger on desktop
        }
      }

      // Check service card text
      const serviceCards = page.locator('.service-card');
      if (await serviceCards.count() > 0) {
        await serviceCards.first().scrollIntoViewIfNeeded();
        
        const cardTitle = serviceCards.first().locator('h3');
        if (await cardTitle.count() > 0) {
          await expect(cardTitle).toBeVisible();
        }
      }
    }
  });
});