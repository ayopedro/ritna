import type { LogRecordExporter } from '@opentelemetry/sdk-logs';

export function reportLogExportFailures(exporter: LogRecordExporter): LogRecordExporter {
  return {
    export(records, callback) {
      exporter.export(records, (result) => {
        if (result.code !== 0) {
          console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'error',
            event: 'telemetry.logs.export_failed',
            errorCode: 'OTLP_LOG_EXPORT_FAILED',
            errorType: result.error?.name ?? 'Error',
          }));
        }
        callback(result);
      });
    },
    shutdown: () => exporter.shutdown(),
    forceFlush: () => exporter.forceFlush(),
  };
}
