import { expect, test } from '@playwright/test';

test('admin page requires credentials and shows dashboard after login', async ({
  browser,
  request,
}) => {
  const denied = await request.get('/admin');
  expect(denied.status()).toBe(401);

  const context = await browser.newContext({
    httpCredentials: {
      username: process.env.ADMIN_USERNAME!,
      password: process.env.ADMIN_PASSWORD!,
    },
  });
  try {
    const page = await context.newPage();
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Waitlist' })).toBeVisible();
  } finally {
    await context.close();
  }
});
