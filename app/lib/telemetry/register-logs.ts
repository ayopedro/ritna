import { log } from '../logger';
import { reportLogExportFailures } from './log-exporter';
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
import { logs } from '@opentelemetry/api-logs';

let provider: LoggerProvider | undefined;

export function registerLogs() {
  if (provider) return;
  if (process.env.OTEL_LOGS_EXPORTER === 'none') {
    console.info(JSON.stringify({ event: 'telemetry.logs.disabled', reason: 'OTEL_LOGS_EXPORTER=none' }));
    return;
  }
  if (
    !process.env.OTEL_EXPORTER_OTLP_ENDPOINT &&
    !process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT
  ) {
    console.info(JSON.stringify({ event: 'telemetry.logs.disabled', reason: 'No OTLP logs or shared endpoint configured' }));
    return;
  }
  provider = new LoggerProvider({
    resource: resourceFromAttributes({
      'service.name': process.env.OTEL_SERVICE_NAME || 'ritna',
    }).merge(detectResources({ detectors: [envDetector] })),
    processors: [
      new BatchLogRecordProcessor({ exporter: reportLogExportFailures(new OTLPLogExporter()) }),
    ],
  });
  logs.setGlobalLoggerProvider(provider);
  log('info', 'telemetry.logs.ready');
  process.once('SIGTERM', () => {
    void shutdownLogs();
  });
  process.once('SIGINT', () => {
    void shutdownLogs();
  });
}

export async function shutdownLogs() {
  logs.disable();
  const active = provider;
  provider = undefined;
  await active?.shutdown();
}
