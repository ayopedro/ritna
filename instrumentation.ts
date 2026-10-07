export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.OTEL_SDK_DISABLED?.toLowerCase() !== 'true' &&
    (process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT)
  ) {
    const { registerOTel } = await import('@vercel/otel');
    const { BatchSpanProcessor } =
      await import('@opentelemetry/sdk-trace-base');
    const { OTLPTraceExporter } =
      await import('@opentelemetry/exporter-trace-otlp-proto');
    const { privacySpanProcessor } =
      await import('./app/lib/telemetry/privacy');
    const disabled = process.env.OTEL_SDK_DISABLED;
    delete process.env.OTEL_SDK_DISABLED;
    try {
      registerOTel({
        serviceName: process.env.OTEL_SERVICE_NAME || 'ritna',
        instrumentations: [],
        propagators: ['tracecontext', 'baggage'],
        spanProcessors:
          process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
          process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
            ? [
                privacySpanProcessor,
                new BatchSpanProcessor(new OTLPTraceExporter()),
              ]
            : [privacySpanProcessor],
      });
      const { registerLogs } =
        await import('./app/lib/telemetry/register-logs');
      registerLogs();
    } finally {
      if (disabled !== undefined) process.env.OTEL_SDK_DISABLED = disabled;
    }
  }
}
