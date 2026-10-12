import { afterEach, expect, test } from 'bun:test';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
  InMemoryLogRecordExporter,
} from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';
import { log, logContext } from '../../app/lib/logger';

afterEach(() => {
  logs.disable();
});

test('application logs export structured JSON, severity and request context while retaining stdout', async () => {
  const exporter = new InMemoryLogRecordExporter();
  const provider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor({ exporter })],
  });
  logs.setGlobalLoggerProvider(provider);
  const original = console.warn;
  const lines: string[] = [];
  console.warn = (line: string) => {
    lines.push(line);
  };
  try {
    logContext.run(
      { requestId: 'request-test', route: '/api/test', method: 'POST' },
      () => {
        log('warn', 'test.log', {
          status: 400,
          password: 'private-secret',
        } as Parameters<typeof log>[2]);
      },
    );
    await provider.forceFlush();
    const record = exporter.getFinishedLogRecords()[0];
    expect(record.severityText).toBe('WARN');
    expect(record.attributes).toMatchObject({
      'event.name': 'test.log',
      'request.id': 'request-test',
      'http.response.status_code': 400,
    });
    expect(record.body).toBe(lines[0]);
    expect(String(record.body)).not.toContain('private-secret');
  } finally {
    console.warn = original;
    logs.disable();
    await provider.shutdown();
  }
});

test('log exporter reports failures on stdout without leaking collector error messages', async () => {
  const { reportLogExportFailures } = await import('../../app/lib/telemetry/log-exporter');
  const original = console.error;
  const lines: string[] = [];
  console.error = (line: string) => { lines.push(line); };
  try {
    let called = false;
    const exporter = reportLogExportFailures({
      export(_records, callback) { callback({ code: 1, error: new Error('Bearer private-collector-secret') }); },
      async forceFlush() {},
      async shutdown() {},
    });
    exporter.export([], () => { called = true; });
    expect(called).toBe(true);
    expect(JSON.parse(lines[0])).toMatchObject({ event: 'telemetry.logs.export_failed', errorCode: 'OTLP_LOG_EXPORT_FAILED' });
    expect(lines[0]).not.toContain('private-collector-secret');
  } finally { console.error = original; }
});
