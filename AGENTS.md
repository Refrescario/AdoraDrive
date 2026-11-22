# AdoraDrive — Regras de desenvolvimento

## Stack
- TanStack Start (SSR) + React 19 + Vite
- Supabase (PostgreSQL, Auth, RLS)
- Tailwind CSS v4 + Radix UI
- Drizzle ORM (migrations em `drizzle/migrations/`)
- Bun como package manager

## Regras do projeto

- Halo background videos share the image's stage and gauge coordinates, play muted in a loop only while animation is enabled, and retain the still image as a loading/error fallback to preserve dashboard alignment.
- Keep theme variants in the shared catalog with separate IDs for distinct artwork and static/animated versions so new media never replaces an existing selection.
- Theme animation is independent of access status; persist selections across reloads and migrate legacy trial selections without a deadline, preserving existing catalog IDs.
- Theme palettes belong to the shared catalog and apply through a single app-level data attribute with semantic CSS tokens, never through the current tab, so navigation and preview expiry keep every view synchronized.
- Each catalog artwork has its own sky-only asset shared by its free and animated variants; secondary views and worship use that sky while home retains figures, rings and videos, keeping navigation and trial expiry coordinated.
- Scanner uses a transparent fixed-aspect SVG stage with an orthographic overhead, brand-neutral cutaway showing seats, chassis and wheels, plus clipped CSS scan effects driven by existing scan state; this preserves USB/demo diagnostics and exposes the selected page background.
- Scanner transport supports aborts and treats missing PIDs separately from connection errors; USB failures never fall back to demo so fictitious results cannot be mistaken for vehicle readings.
- Scanner history is account-scoped in Cloud with RLS; unsigned readings stay in session memory only, and comparisons match vehicle label and source so demo and USB readings are never mixed.
- Scanner code explanations and comparison logic live in a browser-safe shared module; descriptions are educational, not a definitive parts diagnosis.
- Below 1024px, use bottom navigation and a contained 16:9 Halo stage above telemetry; mount only the visible stage to avoid duplicate video playback, and keep the full-screen stage on wider displays so artwork and gauge stay aligned without cropping mobile previews.
- Commerce screens are separate leaf routes using a shared theme-aware shell; never fabricate prices or checkout links, and keep application licensing independent of theme selection.
- Offline application licenses use ECDSA signatures and a nonextractable installation key in IndexedDB; reverify signatures on load, never treat local flags as authorization, and do not claim a browser identity is a physical hardware identifier.
- License issuance requires authenticated server-side role verification before privileged imports; only encrypted signing keys persist in Cloud, key-pair installation is atomic, and repeated issuance for a device recovers its original license.
- Offline verification requires public verification keys downloaded over the configured Cloud connection; it is not an offline installer or DRM, and cached client state is not a production payment entitlement.

## Schemas e migrations
Edite `drizzle/schema.ts` e gere migrations com:
```
bun drizzle-kit generate
bun drizzle-kit push
```

## Variáveis de ambiente
Todas as variáveis estão documentadas no `.env` do projeto. Nunca commite valores reais.
Segredos de produção ficam nas variáveis de ambiente da plataforma de hospedagem (Vercel, Cloudflare, Railway, etc).
