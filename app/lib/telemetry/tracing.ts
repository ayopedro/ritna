import {
  trace,
  SpanStatusCode,
  isSpanContextValid,
  type Attributes,
  type Span,
} from '@opentelemetry/api';

export function traceFields() {
  const context = trace.getActiveSpan()?.spanContext();
  return context && isSpanContextValid(context)
    ? { traceId: context.traceId, spanId: context.spanId }
    : {};
}

export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  operation: (span: Span) => Promise<T>,
): Promise<T> {
  return trace
    .getTracer('ritna')
    .startActiveSpan(name, { attributes }, async (span) => {
      try {
        return await operation(span);
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.setAttribute(
          'error.type',
          error instanceof Error ? error.name : 'UnknownError',
        );
        throw error;
      } finally {
        span.end();
      }
    });
}
