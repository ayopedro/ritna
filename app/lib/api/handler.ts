import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { log, logContext, logError } from '@/app/lib/logger';
import { requireAdmin, validAdminOrigin } from '@/app/lib/auth/basic';

export function withApi<T extends unknown[]>(
  route: string,
  handler: (request: NextRequest, ...args: T) => Promise<Response>,
  admin = false,
) {
  return async (request: NextRequest, ...args: T) => {
    const requestId = randomUUID();
    const started = Date.now();
    return logContext.run(
      { requestId, route, method: request.method },
      async () => {
        let response: Response;
        try {
          const denied = admin ? requireAdmin(request) : null;
          if (denied) {
            response = denied;
          } else if (
            admin &&
            !['GET', 'HEAD'].includes(request.method) &&
            !validAdminOrigin(request)
          ) {
            response = NextResponse.json(
              { success: false, message: 'Invalid request origin.' },
              { status: 403 },
            );
          } else {
            response = await handler(request, ...args);
          }
        } catch (error) {
          logError('api.unhandled_error', error);
          response = NextResponse.json(
            {
              success: false,
              message: 'An unexpected error occurred.',
              requestId,
            },
            { status: 500 },
          );
        }
        response.headers.set('X-Request-ID', requestId);
        response.headers.set('Cache-Control', 'no-store');
        log(
          response.status >= 500
            ? 'error'
            : response.status >= 400
              ? 'warn'
              : 'info',
          'api.request_completed',
          { status: response.status, durationMs: Date.now() - started },
        );
        return response;
      },
    );
  };
}
