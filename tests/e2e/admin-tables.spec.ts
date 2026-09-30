import { expect, test } from '@playwright/test';

test.use({
  httpCredentials: {
    username: process.env.ADMIN_USERNAME!,
    password: process.env.ADMIN_PASSWORD!,
  },
});

test('admin tables preserve selection across pages and adapt to mobile', async ({
  page,
}) => {
  const orderRows = Array.from({ length: 12 }, (_, index) => ({
    id: `order-${index}`,
    firstName: `Reader ${index}`,
    lastName: 'Test',
    email: `reader${index}@example.com`,
    status: 'pending',
    paymentStatus: index === 0 ? 'succeeded' : 'pending',
    createdAt: '2026-09-30T10:00:00Z',
  }));
  await page.route('**/api/admin/overview', (route) =>
    route.fulfill({
      json: {
        success: true,
        data: {
          orderCount: 120,
          waitlistCount: 0,
          reviewCount: 0,
          orderRows,
          waitlistRows: [],
        },
      },
    }),
  );
  await page.goto('/admin');
  const orders = page.getByRole('region', { name: 'Orders', exact: true });
  await expect(
    orders.getByText('Showing 12 of 120 records.', { exact: false }),
  ).toBeVisible();
  await orders
    .getByRole('checkbox', { name: 'Select all orders on this page' })
    .check();
  await expect(orders.getByRole('status')).toHaveText(
    '10 selected · 10 unique email addresses',
  );
  await orders.getByRole('button', { name: 'Next', exact: true }).click();
  await orders
    .getByRole('checkbox', {
      name: 'Select reader10@example.com (order-10)',
      exact: true,
    })
    .check();
  await expect(orders.getByRole('status')).toHaveText(
    '11 selected · 11 unique email addresses',
  );
  await orders.getByRole('searchbox').fill('Paid');
  await expect(orders.getByRole('status')).toHaveCount(0);
  await expect(
    orders.getByRole('checkbox', {
      name: 'Select reader0@example.com (order-0)',
      exact: true,
    }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(orders.getByRole('table')).toBeHidden();
  await orders
    .getByRole('checkbox', {
      name: 'Select reader0@example.com (order-0)',
      exact: true,
    })
    .check();
  await expect(orders.getByRole('status')).toHaveText(
    '1 selected · 1 unique email addresses',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
