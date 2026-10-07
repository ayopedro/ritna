import { SeverityNumber, type Logger } from '@opentelemetry/api-logs';
import type { Attributes } from '@opentelemetry/api';

let telemetryLogger: Logger | undefined;

export function setTelemetryLogger(logger?: Logger) {
  telemetryLogger = logger;
}

export function emitTelemetryLog(
  level: 'info' | 'warn' | 'error',
  body: string,
  attributes: Attributes,
) {
  try {
    telemetryLogger?.emit({
      body,
      severityText: level.toUpperCase(),
      severityNumber: {
        info: SeverityNumber.INFO,
        warn: SeverityNumber.WARN,
        error: SeverityNumber.ERROR,
      }[level],
      attributes,
    });
  } catch {}
}
