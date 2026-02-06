# Minimal Reproduction: opennextjs-cloudflare #1115

**`cacheComponents: true` (PPR) serves only the cached static shell on cache HITs without streaming dynamic content.**

Issue: https://github.com/opennextjs/opennextjs-cloudflare/issues/1115

**Live demo:** https://ppr-repro.tristan-bessoussa.workers.dev/

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

## Evidence

**Request 1 (cache MISS)** — works correctly:
- Headers: `x-nextjs-postponed: 1` (PPR active)
- Response: Full HTML with streaming scripts, `$RC("B:0","S:0")` resolves the Suspense boundary
- Dynamic content: Header with timestamp and theme rendered

**Request 2+ (cache HIT)** — broken:
- Headers: `x-nextjs-cache: HIT`, `x-nextjs-prerender: 1`, no `x-nextjs-postponed`
- Response: Only the static shell HTML ending at `"Loading shell..."` — no streaming scripts, no `$RC` boundary resolution
- Dynamic content: Never arrives, page stuck on fallback forever

## Workaround

Disable `cacheComponents` and add `export const dynamic = 'force-dynamic'` to the root layout. This forces full SSR on every request (no PPR).
