import { configuredProvider } from './configuration';

function publicOrigin(value: string): string {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    ['0.0.0.0', '[::]', '::'].includes(url.hostname) ||
    url.username ||
    url.password
  ) {
    throw new Error('Payment redirect requires a public HTTP or HTTPS origin.');
  }
  return url.origin;
}

export function getPaymentResultUrl(request: Request, reference: string): URL {
  const configuredCallback = (
    configuredProvider() === 'bachs'
      ? process.env.BACHS_CALLBACK_URL
      : process.env.PAYSTACK_CALLBACK_URL
  )?.trim();
  let origin: string;
  if (configuredCallback) {
    origin = publicOrigin(configuredCallback);
  } else {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers
      .get('x-forwarded-host')
      ?.split(',')[0]
      .trim();
    const forwardedProtocol = request.headers
      .get('x-forwarded-proto')
      ?.split(',')[0]
      .trim();
    const host =
      forwardedHost || request.headers.get('host') || requestUrl.host;
    const protocol = forwardedProtocol || requestUrl.protocol.slice(0, -1);
    origin = publicOrigin(`${protocol}://${host}`);
  }
  const destination = new URL('/preorder/payment', origin);
  destination.searchParams.set('reference', reference);
  return destination;
}
