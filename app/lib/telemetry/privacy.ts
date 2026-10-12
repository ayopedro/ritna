import type {
  SpanProcessor,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-node';

export function sanitizeSpan(span: ReadableSpan) {
  for (const key of Object.keys(span.attributes)) {
    if (
      /url|target|query|statement|header|cookie|body|exception|stack|email|password|token/i.test(
        key,
      )
    )
      delete span.attributes[key];
  }
  delete span.status.message;
  for (const event of span.events) {
    for (const key of Object.keys(event.attributes ?? {})) {
      if (
        /url|target|query|statement|header|cookie|body|stack|email|password|token|exception.message/i.test(
          key,
        )
      )
        delete event.attributes![key];
    }
    if (event.name === 'exception')
      event.attributes = {
        'exception.type': event.attributes?.['exception.type'] ?? 'Error',
      };
  }
}

export const privacySpanProcessor: SpanProcessor = {
  onStart() {},
  onEnd: sanitizeSpan,
  async shutdown() {},
  async forceFlush() {},
};
