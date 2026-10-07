import { afterEach, expect, test } from 'bun:test';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
  InMemoryLogRecordExporter,
} from '@opentelemetry/sdk-logs';
import { setTelemetryLogger } from '../../app/lib/telemetry/logs';
import { log, logContext } from '../../app/lib/logger';

afterEach(() => {
  setTelemetryLogger();
});

test('application logs export structured JSON, severity and request context while retaining stdout', async () => {
  const exporter = new InMemoryLogRecordExporter();
  const provider = new LoggerProvider({
    processors: [new SimpleLogRecordProcessor({ exporter })],
  });
  setTelemetryLogger(provider.getLogger('ritna-test'));
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
    setTelemetryLogger();
    await provider.shutdown();
  }
});
