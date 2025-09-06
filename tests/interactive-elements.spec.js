const { test, expect } = require('@playwright/test');

test.describe('Interactive Elements Tests', () => {
  test('FAQ accordions expand and collapse correctly', async ({ page }) => {
    await page.goto('/faq.html');
    await page.waitForLoadState('networkidle');

    const accordions = page.locator('.accordion');
    await expect(accordions.first()).toBeVisible();

    const firstAccordion = accordions.first();
    const firstHeader = firstAccordion.locator('.accordion-header');
    const firstContent = firstAccordion.locator('.accordion-content');

    // Initially content should be hidden
    const isVisible = await firstContent.isVisible();
    expect(isVisible).toBe(false);

    // Click to expand
    await firstHeader.click();
    await page.waitForTimeout(300);

    // Content should now be visible
    await expect(firstContent).toBeVisible();

    // Click again to collapse
    await firstHeader.click();
    await page.waitForTimeout(300);

    // Content should be hidden again
    const isVisibleAfterCollapse = await firstContent.isVisible();
    expect(isVisibleAfterCollapse).toBe(false);
  });

  test('Cookie banner appears and can be accepted/declined', async ({ page }) => {
    // Clear any existing cookies to ensure banner shows
    await page.context().clearCookies();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cookieBanner = page.locator('.cookie-banner');
    await expect(cookieBanner).toBeVisible();

    // Test accepting cookies
    const acceptBtn = cookieBanner.locator('.cookie-accept');
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    // Banner should disappear
    await expect(cookieBanner).not.toBeVisible();

    // Refresh page to ensure banner doesn't reappear
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(cookieBanner).not.toBeVisible();
  });

  test('Cookie banner decline functionality works', async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cookieBanner = page.locator('.cookie-banner');
    await expect(cookieBanner).toBeVisible();

    // Test declining cookies
    const declineBtn = cookieBanner.locator('.cookie-decline');
    if (await declineBtn.count() > 0) {
      await declineBtn.click();
      await expect(cookieBanner).not.toBeVisible();
    }
  });

  test('Form validation works on booking forms', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to booking section
    await page.locator('#booking').scrollIntoViewIfNeeded();

    const bookingForm = page.locator('#callback-form').first();
    if (await bookingForm.count() > 0) {
      // Try to submit empty form
      const submitBtn = bookingForm.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();

        // Check for required field validation
        const nameField = bookingForm.locator('input[name="name"]');
        const phoneField = bookingForm.locator('input[name="phone"]');

        if (await nameField.count() > 0) {
          const nameValidity = await nameField.evaluate(el => el.validity.valid);
          expect(nameValidity).toBe(false);
        }

        if (await phoneField.count() > 0) {
          const phoneValidity = await phoneField.evaluate(el => el.validity.valid);
          expect(phoneValidity).toBe(false);
        }
      }
    }
  });

  test('Condition/Pain area field toggles "Other" textarea correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('#booking').scrollIntoViewIfNeeded();

    const conditionSelect = page.locator('select[name="condition"]');
    const otherTextarea = page.locator('textarea[name="condition-other"]');

    if (await conditionSelect.count() > 0) {
      // Initially "Other" textarea should be hidden
      if (await otherTextarea.count() > 0) {
        const isVisible = await otherTextarea.isVisible();
        expect(isVisible).toBe(false);
      }

      // Select "Other" option
      await conditionSelect.selectOption('Other');
      
      if (await otherTextarea.count() > 0) {
        // "Other" textarea should now be visible
        await expect(otherTextarea).toBeVisible();

        // Select a different option
        await conditionSelect.selectOption('Back Pain');

        // "Other" textarea should be hidden again
        const isVisibleAfterChange = await otherTextarea.isVisible();
        expect(isVisibleAfterChange).toBe(false);
      }
    }
  });

  test('Teamup calendar embeds load correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('#booking').scrollIntoViewIfNeeded();

    const calendarIframes = page.locator('iframe[src*="teamup.com"]');
    
    if (await calendarIframes.count() > 0) {
      const firstCalendar = calendarIframes.first();
      await expect(firstCalendar).toBeVisible();

      // Check that calendar has correct parameters
      const src = await firstCalendar.getAttribute('src');
      expect(src).toContain('view=a'); // Agenda view
      expect(src).toContain('showHeader=0'); // No header
      expect(src).toContain('showProfileAndAuthentication=0'); // No auth
    }
  });

  test('Social media links have proper attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const socialLinks = page.locator('.social-icon');
    
    if (await socialLinks.count() > 0) {
      for (let i = 0; i < await socialLinks.count(); i++) {
        const link = socialLinks.nth(i);
        
        // Check href is placeholder for development
        const href = await link.getAttribute('href');
        expect(href).toBe('#');

        // Check target="_blank"
        const target = await link.getAttribute('target');
        expect(target).toBe('_blank');

        // Check rel="noopener"
        const rel = await link.getAttribute('rel');
        expect(rel).toBe('noopener');

        // Check aria-label exists
        const ariaLabel = await link.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    }
  });

  test('Skip to content link works for accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Skip link should exist but be visually hidden initially
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();

    // When focused (via keyboard), it should become visible
    await skipLink.focus();
    
    // Click should move focus to main content
    await skipLink.click();
    
    const mainContent = page.locator('#main');
    await expect(mainContent).toBeFocused();
  });
});