This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin

Configure `ADMIN_APP_URL` with the site origin, `RESEND_API_KEY`, and a verified `ADMIN_EMAIL_FROM` (or `ORDER_EMAIL_FROM`). Production requires an HTTPS origin. Apply migrations with `bun run db.apply`.

Admins are managed in the `admin_users` database table, which supports multiple email addresses. Add trimmed, lowercase addresses manually; IDs, timestamps, and `active = true` are assigned automatically. Replace these example addresses with the intended admins:

```sql
INSERT INTO admin_users (email)
VALUES ('admin-one@example.com'), ('admin-two@example.com')
ON CONFLICT (email) DO NOTHING;
```

Alternatively, set the private `ADMIN_EMAIL` environment variable and run `bun run db.seed` to bootstrap one admin. Leave it blank to skip admin seeding. The deployment and test seed workflows read the optional GitHub Actions `ADMIN_EMAIL` variable (`vars.ADMIN_EMAIL`). Keep real email addresses in the database or private configuration, never tracked files or `NEXT_PUBLIC_` variables. Seed reruns preserve existing admins and their active state.

Open `/admin` and request a login link using an active admin’s email. Clicking the emailed link creates a seven-day session and opens the dashboard automatically. Links expire after five minutes and can be used once; requests have a one-minute cooldown per admin. Signing out revokes the current session. Set an admin’s `active` field to `false` to revoke all their access, including existing sessions. There is no public registration.

The dashboard shows overview stats first, followed by a books table with availability badges. Each row’s pencil button opens an editor for title, description, edition, cover image, whole-naira price, and preorder availability. Unavailable books cannot be added to checkout. The server validates availability and uses current database prices for new orders; existing orders retain their original prices. Re-running the book seed preserves dashboard edits.

## End-to-end tests

Run `bun run test:e2e` after installing Playwright Chromium. CI starts PostgreSQL, applies migrations, seeds the data, and runs the tests automatically.

## API logging and access

Admin access uses database-backed sessions in HttpOnly, SameSite=Lax cookies (Secure in production). Raw login and session tokens are never stored in the database; only SHA-256 hashes are stored. Login secrets are carried in URL fragments and automatically exchanged by POST when the login page opens. Both `/admin` and private API handlers validate active admin sessions. Admin mutations and auth POSTs enforce `ADMIN_APP_URL` as the request origin. Production requires an HTTPS `ADMIN_APP_URL`. The public book catalog, waitlist signup/count, preorder, payment initiation/callback, and signature-verified webhooks remain accessible to customers.

Private APIs include admin overview, customer endpoints, order listing/detail, and payment listing. Public checkout, books, waitlist, callback, and signed webhook routes remain accessible. Private POST requests also require an `Origin` header matching the application origin.

All API handlers write structured JSON logs to standard output/error. Your hosting platform can collect these logs; optional OpenTelemetry tracing can export to an OTLP collector (see below). Each response has an `X-Request-ID` header. Search that ID to correlate the route, method, response status, duration, and related service events. Routes are logged as templates, without query strings or customer identifiers from URLs.

Events include `api.request_completed`, `api.unhandled_error`, `order.created`, `order.reused`, `payment.initialized`, `payment.verified`, `email.confirmation_sent`, and `email.confirmation_pending`. Unexpected errors record their type and recognized database/network code, without raw messages, SQL, request bodies, cookies, credentials, or customer contact details.

The unimplemented order listing/detail, customer detail, and payment listing endpoints return HTTP 501 instead of placeholder successes. Customer lists are limited to 100 records. Unknown server errors return a generic JSON response rather than database details.

Run `bun test tests/unit` for authentication, logging, payment, and email unit checks. Database integration and browser checks require the configured database and Playwright browser installation.

### Bachs payments

Apply the database migration with `bun run db.apply` before deploying this change.
Bachs is the default provider for new orders. Configure `PAYMENT_PROVIDER=bachs`, `BACHS_API_KEY`,
`BACHS_CALLBACK_URL=https://your-domain/api/payments/callback`, and
`BACHS_WEBHOOK_SECRET`. Set `PAYMENT_PROVIDER=paystack` to explicitly use Paystack for new orders. Keep Paystack credentials configured to verify existing
Paystack orders. In Bachs, register `https://your-domain/api/payments/webhook/bachs`
for `collection.succeeded` and `checkout.completed` events using an account-scoped
endpoint. Use the endpoint's signing secret as `BACHS_WEBHOOK_SECRET`.

`sk_sandbox_` keys use the sandbox API; `sk_live_` keys use production. Checkout
collects the order total in NGN with card or bank transfer. Server-side verification
checks the checkout, order reference, customer, currency, amount, and settled charge
before confirming the order. Open sessions are reused; expired or cancelled sessions
can be replaced. Initialization retries use the same idempotency key. An existing
order retains its payment provider even when the configured default changes.

API contract: [Bachs OpenAPI](https://docs.bachs.io/docs/openapi/openapi.json).
Webhook signatures: [Bachs webhooks](https://docs.bachs.io/guides/webhooks/overview).

Payment providers implement `PaymentService` and are selected by
`getPaymentService(provider)`. Order routes supply the configured service;
existing attempts and verification select the service recorded on the payment.
Provider services own configuration, checkout initialization, and verification,
while order persistence and confirmation remain shared.

For checkout diagnostics, `payment.checkout_requested` logs the Bachs payload
with customer identity redacted and callback query parameters removed.
`payment.checkout_response` records the HTTP status and checkout hostname,
without the session path or token. Both correlate with the request ID and order ID.
Hosted checkout validation accepts HTTPS Bachs-owned domains and Paystack's
checkout host, rejecting unrelated hosts, embedded credentials, and custom ports.

Orders have a readable reference such as `RITNA-8F3A91C7D2B6`, generated from 12 random
hexadecimal characters with a database unique constraint. Rare collisions retry
reference allocation up to three times. Apply `bun run db.apply` before running the
updated app; the migration also assigns references to existing orders. References
appear in confirmation emails, the payment result page, and the admin orders table,
where they can be searched and sorted. New provider payment references include the
order reference; existing provider references remain valid. UUIDs remain internal
identifiers. Retries reuse the saved order reference. Existing references retain their values. Previously sent receipts and emails are unchanged.


### OpenTelemetry tracing

The Next.js `instrumentation.ts` hook registers OpenTelemetry on the server when
`OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`, or
`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` is configured.
Set `OTEL_SERVICE_NAME=ritna` and `OTEL_EXPORTER_OTLP_ENDPOINT` to your Alloy or
OpenTelemetry collector's HTTP base URL; `/v1/traces` is appended automatically.
Alternatively, set `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` to the complete URL,
including `/v1/traces`. Avoid a trailing slash on the base URL. Use
`OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf` (HTTP port 4318, not gRPC port 4317).
For collector authentication, `OTEL_EXPORTER_OTLP_HEADERS` accepts comma-separated
headers with URL-encoded values, for example `Authorization=Basic%20<base64 credentials>`.
These variables are server-only; never prefix them with `NEXT_PUBLIC_`.

Traces include Next.js framework spans, API route spans, payment initialization and
verification, and database transactions for creating orders and confirming payment.
Application logs are exported in batches over OTLP to `/v1/logs` and also remain
structured JSON on stdout/stderr. `traceId` and `spanId` link logs to active traces. API responses include `X-Trace-ID` when
tracing is active. There is no browser SDK or metrics exporter in this setup.

Spans record route templates, provider names, status and timings. Customer details,
checkout session URLs, raw SQL, headers, and raw exception messages are excluded.
Fetch auto-instrumentation is disabled; provider service spans trace the full operation.

Restart/redeploy after configuration changes. No endpoint means tracing stays off;
`OTEL_SDK_DISABLED=true` disables SDK startup explicitly. To sample fewer requests,
set `OTEL_TRACES_SAMPLER=parentbased_traceidratio` and `OTEL_TRACES_SAMPLER_ARG=0.1`
for 10% of root traces. Export is batched and requires the collector to accept OTLP
traces. This does not provision Alloy, Tempo, or a Grafana dashboard.


Application logs use the same `OTEL_EXPORTER_OTLP_ENDPOINT` and
`OTEL_EXPORTER_OTLP_HEADERS` as traces. To override the log destination, set
`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` to a complete URL ending in `/v1/logs` and
`OTEL_EXPORTER_OTLP_LOGS_HEADERS` for signal-specific authentication. The log
exporter sends HTTP/protobuf. Set `OTEL_LOGS_EXPORTER=none` to keep only stdout
logging. Generate API traffic after restarting, then allow a few seconds for batch
export. Only calls to the application logger are exported; arbitrary console output
and Next.js startup messages are not intercepted. Alloy must have its OTLP logs
receiver connected to the logs backend (usually Loki); a working Tempo trace
pipeline alone does not collect logs.


Log export registers the OpenTelemetry global logger provider so instrumentation
and API route bundles share it in the production Next.js server. On startup,
`telemetry.logs.ready` is written to stdout and exported. Search Loki for
`{service_name="ritna"}` after redeploying, then make an API request to generate
`api.request_completed`. `telemetry.logs.disabled` explains missing log endpoints
or explicit disabling; `telemetry.logs.export_failed` in server stdout indicates
an exporter failure. These diagnostics do not include collector credentials.

Self-hosted tracing uses explicit HTTP/protobuf OTLP export and W3C trace-context
and baggage propagation. Vercel-specific telemetry propagation and exporters are
not enabled, so the application does not require a Vercel telemetry extension.


Admin authentication verification: `bun test tests/unit`; run database integration checks with `bun --env-file=.env.local test tests/integration/admin-auth.test.ts`. Integration tests create temporary admin/book/order fixtures and mock email delivery. Admin browser tests use temporary database sessions: `bunx playwright test tests/e2e/admin.spec.ts tests/e2e/admin-tables.spec.ts`.
