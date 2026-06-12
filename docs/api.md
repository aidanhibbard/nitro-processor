---
title: API
---

# API

Reference for module options, runtime config, helpers, and the CLI.

## Imports

| Alias | Exports |
| --- | --- |
| `#processor` | `defineQueue`, `defineWorker` |
| `#processor-utils` | `useProcessor`, BullMQ types (`Queue`, `Worker`, `Processor`, …) |
| `#bullmq` | Re-exports from `bullmq` |

```ts
import { defineQueue, defineWorker } from '#processor'
import type { Job } from '#bullmq'
```

## Module options

Configure when registering the module in `nitro.config.ts` or `vite.config.ts`. See [Configuration](/configuration) for Vite setup and `buildDir`.

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
npx nitro-processor dev --buildDir .nitro
```

| Arg | Type | Purpose |
| --- | --- | --- |
| `dir` | positional (default `.`) | Project root |
| `--buildDir` | string | Nitro `buildDir` relative to project root (disables auto-probe) |
| `--workers` | string | Comma-separated worker names filter |
| `--nodeArgs` | string | Extra Node flags (e.g. `--inspect`) |
| `--verbose` | boolean | Log resolved watch paths |

Dev workers entry: `{buildDir}/dev/workers/index.mjs` (default `node_modules/.nitro/dev/workers/index.mjs`).

Prod workers entry: `.output/server/workers/index.mjs`.
