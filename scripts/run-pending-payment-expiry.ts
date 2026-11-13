const appUrl = process.env.ADMIN_APP_URL;
const secret = process.env.CRON_SECRET;

if (!appUrl || !secret) {
  console.error('ADMIN_APP_URL and CRON_SECRET are required.');
  process.exitCode = 1;
} else {
  try {
    const url = new URL('/api/cron/expire-pending-payments', appUrl);
    if (!['http:', 'https:'].includes(url.protocol))
      throw new Error('ADMIN_APP_URL must use HTTP or HTTPS.');
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${secret}` },
    });
    if (!response.ok)
      throw new Error(`Pending-payment expiry returned HTTP ${response.status}.`);
    console.info(await response.text());
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : 'Pending-payment expiry failed.',
    );
    process.exitCode = 1;
  }
}

export {};
