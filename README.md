# Minimal Reproduction: opennextjs-cloudflare #1115

**`cacheComponents: true` (PPR) serves only the cached static shell on cache HITs without streaming dynamic content.**

Issue: https://github.com/opennextjs/opennextjs-cloudflare/issues/1115

## Setup

```bash
pnpm install
```

## Reproduce locally (works fine)

```bash
pnpm dev
# Open http://localhost:3000 — page renders correctly every time
```

## Reproduce on Cloudflare (bug)

```bash
# Create the R2 bucket first (one-time):
# wrangler r2 bucket create ppr-repro-cache

pnpm deploy
```

1. Open the deployed URL — **works** (cache MISS, full SSR)
2. Refresh the page — **broken** (cache HIT, stuck on "Loading shell..." forever)
3. Check browser DevTools Network tab — response ends prematurely with "Connection closed"

## What's happening

The root layout wraps an async `DynamicShell` component (which reads `cookies()`) inside a `<Suspense>` boundary. With `cacheComponents: true`, Next.js uses PPR:

- **Static shell** (the `<Suspense fallback>`) is cached
- **Dynamic part** (`DynamicShell` reading cookies) should be streamed on every request

On the first request (cache MISS), Next.js does full SSR and everything works. On subsequent requests (cache HIT), the static shell is served from cache but the dynamic streaming never initiates — the response just ends with the fallback HTML.

## Versions

- `next`: `^16.1.6`
- `@opennextjs/cloudflare`: `^1.16.3`
- `wrangler`: `^4.63.0`
- `react`: `^19.2.4`

## Configuration

- `next.config.ts`: `cacheComponents: true`
- `open-next.config.ts`: R2 incremental cache (`r2IncrementalCache`)
- `wrangler.jsonc`: R2 bucket binding `NEXT_INC_CACHE_R2_BUCKET`

## Workaround

Disable `cacheComponents` and add `export const dynamic = 'force-dynamic'` to the root layout. This forces full SSR on every request (no PPR).
