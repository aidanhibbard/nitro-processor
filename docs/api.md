---
title: API
---

# API

Reference for module options, runtime config, helpers, and the CLI.

::: warning Coming soon
Most runtime APIs are planned for a future release. v0.0.1 ships the module factory stub and CLI scaffold only.
:::

## Imports

| Alias | Exports |
| --- | --- |
| `#processor` | `defineQueue`, `defineWorker` (planned) |
| `#processor-utils` | `useProcessor`, BullMQ types (`Queue`, `Worker`, `Processor`, …) (planned) |
| `#bullmq` | Re-exports from `bullmq` (planned) |

```ts
import { defineQueue, defineWorker } from '#processor'
import type { Job } from '#bullmq'
```

## Module options

Configure when registering the module in `nitro.config.ts`:

```ts
import { defineConfig } from 'nitro/config'
import nitroProcessor from 'nitro-processor'

export default defineConfig({
  modules: [
    nitroProcessor({
      workers: 'server/workers',
    }),
  ],
})
```

```ts
interface ModuleOptions {
  /**
   * Folder scanned for worker files ({ts,js,mjs}).
   * @default 'server/workers'
   */
  workers?: string
}
```

## Runtime config

Redis connection settings live on `useRuntimeConfig().redis`. See [Redis configuration](/redis) for `REDIS_*` (dev/build) vs `NITRO_REDIS_*` (runtime).

```ts
interface RuntimeConfig {
  redis: RedisOptions & { url?: string }
}
```

## CLI

```bash
npx nitro-processor dev
npx nitro-processor dev --workers=basic,hello
```

| Arg | Type | Purpose |
| --- | --- | --- |
| `dir` | positional (default `.`) | Project root |
| `--workers` | string | Comma-separated worker names filter |
