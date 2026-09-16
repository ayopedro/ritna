import { expect, test } from '@playwright/test';

test('mobile cart shows selected book and opens shipping', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/books', (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          books: [{
            id: '3514673a-4b58-5be3-a639-aab2f51d2c25',
            title: 'RITNA Hardcover',
            type: 'hardcover',
            price: 35_000,
            image: '/assets/ritna4.jpg',
            description: 'Premium print hardcover edition',
          }],
        },
      },
    }),
  );
  await page.goto('/preorder');

  await page.getByRole('button', { name: 'Increase RITNA Hardcover quantity' }).click();
  const cartButton = page.getByRole('button', { name: /View cart \(1\)/ });
  await expect(cartButton).toContainText('₦35,000');

  await cartButton.click();
  const cart = page.getByRole('dialog', { name: 'Order summary' });
  await expect(cart.getByText('RITNA Hardcover')).toBeVisible();
  await expect(cart.getByText('₦35,000').first()).toBeVisible();

  await cart.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByRole('dialog', { name: 'Your shipping details' })).toBeVisible();
});
