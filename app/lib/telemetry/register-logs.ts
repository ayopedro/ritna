import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import {
  detectResources,
  envDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { setTelemetryLogger } from './logs';

let provider: LoggerProvider | undefined;

export function registerLogs() {
  if (provider || process.env.OTEL_LOGS_EXPORTER === 'none') return;
  if (
    !process.env.OTEL_EXPORTER_OTLP_ENDPOINT &&
    !process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT
  )
    return;
  provider = new LoggerProvider({
    resource: resourceFromAttributes({
      'service.name': process.env.OTEL_SERVICE_NAME || 'ritna',
    }).merge(detectResources({ detectors: [envDetector] })),
    processors: [
      new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() }),
    ],
  });
  setTelemetryLogger(provider.getLogger('ritna'));
  process.once('SIGTERM', () => {
    void shutdownLogs();
  });
  process.once('SIGINT', () => {
    void shutdownLogs();
  });
}

export async function shutdownLogs() {
  setTelemetryLogger();
  const active = provider;
  provider = undefined;
  await active?.shutdown();
}
