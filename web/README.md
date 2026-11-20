# CareerLink Web

Next.js marketing site and web frontend for **CareerLink Somalia**.

For full project documentation — features, routes, setup, design system, and monorepo overview — see the [root README](../README.md).

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

## Key Paths

- `app/` — App Router pages
- `components/landing/` — Landing sections
- `components/auth/` — Login & register UI
- `lib/routes.ts` — Route constants
- `lib/opportunities.ts` — Demo job listings

## Deploying to Cloudflare

This app deploys to Cloudflare Workers (Worker `abuur-web`) through the OpenNext adapter.
Cloudflare Workers Builds runs these from the `web` folder on every push to the production branch:

- Build: `npx opennextjs-cloudflare build`
- Deploy: `npx opennextjs-cloudflare deploy`

Locally, `npm run preview` runs the Worker build on your machine and `npm run deploy` deploys it by hand.
Set `ABUUR_API_URL` and `NEXT_PUBLIC_SITE_URL` as variables on the Worker in the Cloudflare dashboard.
