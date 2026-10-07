export function isTrustedCheckoutUrl(
  value: string,
  provider?: 'bachs' | 'paystack',
): boolean {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      (url.port && url.port !== '443')
    )
      return false;
    const bachs =
      url.hostname === 'bachs.io' || url.hostname.endsWith('.bachs.io');
    const paystack = url.hostname === 'checkout.paystack.com';
    return provider === 'bachs'
      ? bachs
      : provider === 'paystack'
        ? paystack
        : bachs || paystack;
  } catch {
    return false;
  }
}
