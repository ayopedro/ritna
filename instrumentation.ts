export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.OTEL_SDK_DISABLED?.toLowerCase() !== 'true' &&
    (process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT)
  ) {
    const { registerOTel } = await import('@vercel/otel');
    const { privacySpanProcessor } =
      await import('./app/lib/telemetry/privacy');
    const disabled = process.env.OTEL_SDK_DISABLED;
    delete process.env.OTEL_SDK_DISABLED;
    try {
      registerOTel({
        serviceName: process.env.OTEL_SERVICE_NAME || 'ritna',
        instrumentations: [],
        spanProcessors: [privacySpanProcessor, 'auto'],
      });
    } finally {
      if (disabled !== undefined) process.env.OTEL_SDK_DISABLED = disabled;
    }
  }
}
