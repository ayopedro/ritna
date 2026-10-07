import { afterAll, beforeAll, expect, test } from 'bun:test';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import {
  NodeTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { withSpan } from '../../app/lib/telemetry/tracing';
import { privacySpanProcessor } from '../../app/lib/telemetry/privacy';
import { withApi } from '../../app/lib/api/handler';
import { log } from '../../app/lib/logger';
import { NextRequest } from 'next/server';

const exporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider({
  spanProcessors: [privacySpanProcessor, new SimpleSpanProcessor(exporter)],
});
beforeAll(() => {
  provider.register({ contextManager: new AsyncLocalStorageContextManager() });
});
afterAll(async () => {
  await provider.shutdown();
  trace.disable();
  context.disable();
});

test('API, child operations and logs share trace IDs across asynchronous boundaries', async () => {
  exporter.reset();
  const original = console.info;
  const lines: string[] = [];
  console.info = (line: string) => {
    lines.push(line);
  };
  let response: Response;
  try {
    const handler = withApi('/api/test', async () =>
      withSpan('payment.test', { 'payment.provider': 'bachs' }, async () => {
        await Promise.resolve();
        log('info', 'telemetry.test');
        return Response.json({ success: true });
      }),
    );
    response = await handler(
      new NextRequest(
        'https://ritna.example/api/test?email=private@example.com',
      ),
    );
  } finally {
    console.info = original;
  }
  const spans = exporter.getFinishedSpans();
  const parent = spans.find((span) => span.name === 'GET /api/test')!;
  const child = spans.find((span) => span.name === 'payment.test')!;
  expect(parent).toBeDefined();
  expect(child.spanContext().traceId).toBe(parent.spanContext().traceId);
  expect(child.parentSpanContext?.spanId).toBe(parent.spanContext().spanId);
  expect(response!.headers.get('X-Trace-ID')).toBe(
    parent.spanContext().traceId,
  );
  expect(JSON.parse(lines[0]).traceId).toBe(parent.spanContext().traceId);
  expect(JSON.stringify(spans.map((span) => span.attributes))).not.toContain(
    'private@example.com',
  );
});

test('failed spans end with error status without exporting raw exceptions', async () => {
  exporter.reset();
  await expect(
    withSpan('test.failure', {}, async () => {
      throw new Error('secret SQL customer@example.com');
    }),
  ).rejects.toThrow();
  const span = exporter.getFinishedSpans()[0];
  expect(span.status.code).toBe(SpanStatusCode.ERROR);
  expect(span.attributes['error.type']).toBe('Error');
  expect(
    JSON.stringify({
      status: span.status,
      events: span.events,
      attributes: span.attributes,
    }),
  ).not.toContain('secret');
});

test('framework span URL, SQL and exception details are removed before export', async () => {
  exporter.reset();
  await withSpan(
    'test.framework',
    {
      'url.full': 'https://example.com?secret=yes',
      'db.statement': 'select customer',
      'http.request.header.authorization': 'Bearer secret',
      'http.route': '/api/orders/[orderId]',
    },
    async (span) => {
      span.recordException(new Error('private SQL query'));
    },
  );
  const span = exporter.getFinishedSpans()[0];
  expect(span.attributes).toEqual({ 'http.route': '/api/orders/[orderId]' });
  expect(span.events[0].attributes).toEqual({ 'exception.type': 'Error' });
});
