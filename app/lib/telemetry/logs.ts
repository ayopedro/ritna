import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import type { Attributes } from '@opentelemetry/api';

export function emitTelemetryLog(
  level: 'info' | 'warn' | 'error',
  body: string,
  attributes: Attributes,
) {
  try {
    logs.getLogger('ritna').emit({
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
