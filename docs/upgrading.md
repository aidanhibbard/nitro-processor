---
title: Upgrading
---

# Upgrading

::: info New package
`nitro-processor` is a standalone Nitro module. If you are migrating from [nuxt-processor](https://github.com/aidanhibbard/nuxt-processor), use this page as a reference for terminology changes.
:::

## Nuxt → Nitro mapping

| nuxt-processor | nitro-processor |
| --- | --- |
| `modules: ['nuxt-processor']` in `nuxt.config.ts` | `modules: [nitroProcessor()]` in `nitro.config.ts` |
| `NUXT_REDIS_*` runtime env | `NITRO_REDIS_*` runtime env |
| `.nuxt/dev/workers/index.mjs` | Nitro dev workers entry (under `buildDir`) |
| `npx nuxt-processor dev` | `npx nitro-processor dev` |
| `processor` config key in Nuxt config | Module factory options |

## Runtime config

Redis settings follow [Nitro runtime config](https://nitro.build/config#runtimeconfig):

- **`REDIS_*`** — read when the module runs during **`nitro dev` / `nitro build`**.
- **`NITRO_REDIS_*`** — overrides at **runtime** when you run the built server.

## Public API

The planned public API mirrors nuxt-processor:

- `defineQueue` / `defineWorker` from `#processor`
- `useProcessor()` from `#processor-utils`
- Connection resolved from `useRuntimeConfig().redis` when each queue/worker is created
