const { test, expect } = require('@playwright/test');

test.describe('Service Card Behavior Tests', () => {
  test('Individual service card expands when clicked', async ({ page }) => {
    await page.goto('/services.html');
    await page.waitForLoadState('networkidle');

    const serviceCards = page.locator('.service-card');
    await expect(serviceCards.first()).toBeVisible();

    const firstCard = serviceCards.first();
    const firstHeader = firstCard.locator('.service-header');
    const firstContent = firstCard.locator('.service-content');

    // Initially, content should be hidden
    await expect(firstCard).not.toHaveClass(/expanded/);

    // Click to expand
    await firstHeader.click();
    await page.waitForTimeout(500); // Wait for animation

    // Verify card is expanded
    await expect(firstCard).toHaveClass(/expanded/);
    
    // Verify content is visible and has proper height
    const maxHeight = await firstContent.evaluate(el => el.style.maxHeight);
    expect(maxHeight).not.toBe('0px');
    expect(maxHeight).not.toBe('');
  });

  test('Multiple service cards can be expanded simultaneously', async ({ page }) => {
    await page.goto('/services.html');
    await page.waitForLoadState('networkidle');

    const serviceCards = page.locator('.service-card');
    await expect(serviceCards).toHaveCount(6); // Assuming 6 service cards

    const firstCard = serviceCards.nth(0);
    const secondCard = serviceCards.nth(1);
    const firstHeader = firstCard.locator('.service-header');
    const secondHeader = secondCard.locator('.service-header');

    // Expand first card
    await firstHeader.click();
    await page.waitForTimeout(500);

    // Verify first card is expanded
    await expect(firstCard).toHaveClass(/expanded/);

    // Expand second card
    await secondHeader.click();
    await page.waitForTimeout(500);

    // Verify both cards are expanded simultaneously
    await expect(firstCard).toHaveClass(/expanded/);
    await expect(secondCard).toHaveClass(/expanded/);
  });

  test('Service card can be collapsed after expansion', async ({ page }) => {
    await page.goto('/services.html');
    await page.waitForLoadState('networkidle');

    const serviceCards = page.locator('.service-card');
    const firstCard = serviceCards.first();
    const firstHeader = firstCard.locator('.service-header');
    const firstContent = firstCard.locator('.service-content');

    // Expand the card
    await firstHeader.click();
    await page.waitForTimeout(500);
    await expect(firstCard).toHaveClass(/expanded/);

    // Collapse the card
    await firstHeader.click();
    await page.waitForTimeout(500);

    // Verify card is collapsed
    await expect(firstCard).not.toHaveClass(/expanded/);
    
    // Verify content max-height is back to 0
    const maxHeight = await firstContent.evaluate(el => el.style.maxHeight);
    expect(maxHeight).toBe('0px');
  });

  test('Service card expand arrows rotate correctly', async ({ page }) => {
    await page.goto('/services.html');
    await page.waitForLoadState('networkidle');

    const serviceCards = page.locator('.service-card');
    const firstCard = serviceCards.first();
    const firstHeader = firstCard.locator('.service-header');
    const expandArrow = firstCard.locator('.expand-arrow');

    // Initial state - arrow should point down
    await expect(expandArrow).toBeVisible();

    // Expand the card
    await firstHeader.click();
    await page.waitForTimeout(500);

    // Arrow should be rotated (CSS transform applied via .expanded class)
    await expect(firstCard).toHaveClass(/expanded/);
  });

  test('Service cards are keyboard accessible', async ({ page }) => {
    await page.goto('/services.html');
    await page.waitForLoadState('networkidle');

    const serviceCards = page.locator('.service-card');
    const firstCard = serviceCards.first();
    const firstHeader = firstCard.locator('.service-header');

    // Header should be focusable
    await firstHeader.focus();
    await expect(firstHeader).toBeFocused();

    // Should have proper ARIA attributes
    const tabIndex = await firstHeader.getAttribute('tabindex');
    const role = await firstHeader.getAttribute('role');
    const ariaExpanded = await firstHeader.getAttribute('aria-expanded');

    expect(tabIndex).toBe('0');
    expect(role).toBe('button');
    expect(ariaExpanded).toBe('false');

    // Should expand with Enter key
    await firstHeader.press('Enter');
    await page.waitForTimeout(500);

    await expect(firstCard).toHaveClass(/expanded/);
    
    // Aria-expanded should update
    const updatedAriaExpanded = await firstHeader.getAttribute('aria-expanded');
    expect(updatedAriaExpanded).toBe('true');

    // Should also work with Space key
    await firstHeader.press(' ');
    await page.waitForTimeout(500);

    await expect(firstCard).not.toHaveClass(/expanded/);
  });
});