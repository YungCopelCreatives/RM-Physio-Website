const { test, expect } = require('@playwright/test');

test.describe('Text Alignment Tests', () => {
  test('Service cards have center-aligned headers and left-aligned expanded content', async ({ page }) => {
    await page.goto('/services.html');
    await page.waitForLoadState('networkidle');

    // Check service cards exist
    const serviceCards = page.locator('.service-card');
    await expect(serviceCards.first()).toBeVisible();

    // Verify service card headers are center-aligned
    const firstServiceCard = serviceCards.first();
    const textAlign = await firstServiceCard.evaluate(el => getComputedStyle(el).textAlign);
    expect(textAlign).toBe('center');

    // Click on first service card to expand it
    const firstHeader = firstServiceCard.locator('.service-header');
    await firstHeader.click();
    
    // Wait for expansion animation
    await page.waitForTimeout(500);

    // Verify the service card is expanded
    await expect(firstServiceCard).toHaveClass(/expanded/);

    // Check that expanded content (service-details) is left-aligned
    const serviceDetails = firstServiceCard.locator('.service-details');
    await expect(serviceDetails).toBeVisible();
    
    const detailsTextAlign = await serviceDetails.evaluate(el => getComputedStyle(el).textAlign);
    expect(detailsTextAlign).toBe('left');
  });

  test('Booking cards have center-aligned headers and left-aligned forms', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Navigate to booking section
    await page.locator('#booking').scrollIntoViewIfNeeded();

    const bookingCards = page.locator('.booking-card');
    await expect(bookingCards.first()).toBeVisible();

    // Verify booking card is center-aligned
    const firstBookingCard = bookingCards.first();
    const textAlign = await firstBookingCard.evaluate(el => getComputedStyle(el).textAlign);
    expect(textAlign).toBe('center');

    // Check that forms within booking cards are left-aligned
    const contactForm = firstBookingCard.locator('.contact-form');
    if (await contactForm.count() > 0) {
      const formTextAlign = await contactForm.evaluate(el => getComputedStyle(el).textAlign);
      expect(formTextAlign).toBe('left');
    }
  });

  test('Testimonials are center-aligned', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    // Navigate to testimonials section
    const testimonials = page.locator('.testimonial');
    
    if (await testimonials.count() > 0) {
      await testimonials.first().scrollIntoViewIfNeeded();
      await expect(testimonials.first()).toBeVisible();

      // Verify testimonials are center-aligned
      const textAlign = await testimonials.first().evaluate(el => getComputedStyle(el).textAlign);
      expect(textAlign).toBe('center');
    }
  });

  test('Condition cards are center-aligned', async ({ page }) => {
    await page.goto('/conditions/index.html');
    await page.waitForLoadState('networkidle');

    const conditionCards = page.locator('.condition-card');
    await expect(conditionCards.first()).toBeVisible();

    // Verify condition cards are center-aligned
    const textAlign = await conditionCards.first().evaluate(el => getComputedStyle(el).textAlign);
    expect(textAlign).toBe('center');
  });

  test('Info items are center-aligned', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');

    const infoItems = page.locator('.info-item');
    
    if (await infoItems.count() > 0) {
      await infoItems.first().scrollIntoViewIfNeeded();
      await expect(infoItems.first()).toBeVisible();

      // Verify info items are center-aligned
      const textAlign = await infoItems.first().evaluate(el => getComputedStyle(el).textAlign);
      expect(textAlign).toBe('center');
    }
  });
});