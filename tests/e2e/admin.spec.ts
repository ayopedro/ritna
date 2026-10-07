import { expect, test } from '@playwright/test';
import { adminSession, adminLoginLink } from './helpers/admin-session';

test('admin page redirects to login and private APIs reject anonymous requests', async ({ page, request }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: 'Admin login' })).toBeVisible();
  for (const endpoint of ['/api/admin/overview', '/api/admin/records', '/api/customers', '/api/orders', '/api/payments']) {
    expect((await request.get(endpoint)).status()).toBe(401);
  }
});

test('database session allows dashboard access and sign out revokes it', async ({ page, context }) => {
  const cleanup = await adminSession(context);
  try {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Waitlist' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Book management' })).toBeVisible();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    expect((await context.request.get('/api/admin/overview')).status()).toBe(401);
  } finally { cleanup(); }
});

test('book controls save price and availability', async ({ page, context }) => {
  const cleanup = await adminSession(context);
  let book = { id: '3514673a-4b58-5be3-a639-aab2f51d2c25', title: 'Test edition', type: 'hardcover', price: 35000, available: true, image: null, description: null };
  await page.route('**/api/books', (route) => route.fulfill({ json: { success: true, data: { books: [book] } } }));
  await page.route(`**/api/admin/books/${book.id}`, async (route) => {
    expect(route.request().method()).toBe('PATCH');
    expect(route.request().postDataJSON()).toEqual({ title: 'Updated edition', description: 'Updated description', type: 'softcover', image: null, price: 42000, available: false });
    book = { ...book, ...route.request().postDataJSON() };
    await route.fulfill({ json: { success: true, data: book } });
  });
  try {
    await page.goto('/admin');
    await expect(page.getByRole('table', { name: 'Books' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Books' }).getByText('Available', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Edit Test edition' }).click();
    const dialog = page.getByRole('dialog', { name: 'Update book details' });
    await dialog.getByRole('textbox', { name: 'Title', exact: true }).fill('Updated edition');
    await dialog.getByRole('textbox', { name: 'Description' }).fill('Updated description');
    await dialog.getByRole('combobox', { name: 'Edition' }).selectOption('softcover');
    await dialog.getByRole('spinbutton', { name: 'Price' }).fill('42000');
    await page.getByRole('checkbox', { name: 'Available for preorder' }).uncheck();
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Book details saved.' })).toBeVisible();
    await expect(page.getByRole('table', { name: 'Books' }).getByText('Unavailable', { exact: true })).toBeVisible();
    await expect(dialog).toBeHidden();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally { cleanup(); }
});


test('email link creates a session and opens the dashboard automatically', async ({ page, context }) => {
  const { token, cleanup } = await adminLoginLink(context);
  let exchanges = 0;
  page.on('request', (request) => { if (request.url().endsWith('/api/auth/verify')) exchanges++; });
  try {
    await page.goto(`/admin/login#token=${token}`);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
    expect(exchanges).toBe(1);
    expect((await context.cookies()).some((cookie) => cookie.name === 'ritna_admin_session' && cookie.httpOnly)).toBe(true);
  } finally { cleanup(); }
});

test('invalid email link shows an error and lets the admin request a new one', async ({ page }) => {
  await page.goto(`/admin/login#token=${'a'.repeat(64)}`);
  await expect(page.getByRole('status')).toContainText('expired or has already been used');
  await expect(page.getByRole('button', { name: 'Send login link' })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
});
