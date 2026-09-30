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

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env.local` (see `.env.example`), then open `/admin`. The browser prompts for those credentials. The dashboard is read-only and remains unavailable until both values are configured.

## End-to-end tests

Run `bun run test:e2e` after installing Playwright Chromium. CI starts PostgreSQL, applies migrations, seeds the data, and runs the tests automatically.

## API logging and access

Admin access continues to use browser Basic Auth with `ADMIN_USERNAME` and `ADMIN_PASSWORD`. Use HTTPS in production. There is no application login route or session cookie. Both `/admin` and private API handlers check credentials; API protection does not rely on the page proxy.

Private APIs include admin overview, customer endpoints, order listing/detail, and payment listing. Public checkout, books, waitlist, callback, and signed webhook routes remain accessible. Private POST requests also require an `Origin` header matching the application origin.

All API handlers write structured JSON logs to standard output/error. Your hosting platform can collect these logs; no external monitoring service is configured. Each response has an `X-Request-ID` header. Search that ID to correlate the route, method, response status, duration, and related service events. Routes are logged as templates, without query strings or customer identifiers from URLs.

Events include `api.request_completed`, `api.unhandled_error`, `order.created`, `order.reused`, `payment.initialized`, `payment.verified`, `email.confirmation_sent`, and `email.confirmation_pending`. Unexpected errors record their type and recognized database/network code, without raw messages, SQL, request bodies, cookies, credentials, or customer contact details.

The unimplemented order listing/detail, customer detail, and payment listing endpoints return HTTP 501 instead of placeholder successes. Customer lists are limited to 100 records. Unknown server errors return a generic JSON response rather than database details.

Run `bun test tests/unit` for authentication, logging, payment, and email unit checks. Database integration and browser checks require the configured database and Playwright browser installation.
