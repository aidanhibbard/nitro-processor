---
title: Configuration
---

# Configuration

Register `nitro-processor` as a Nitro module and point it at the folder that contains your worker files.

## Module options

```ts
interface ModuleOptions {
  /**
   * Folder scanned for worker files ({ts,js,mjs}).
   * @default 'server/workers'
   */
  workers?: string
}
```

## Standalone Nitro (`nitro.config.ts`)

Use this layout when you run `nitro dev` / `nitro build` directly (no Vite frontend).

```ts
import { defineConfig } from 'nitro/config'
import nitroProcessor from 'nitro-processor'

export default defineConfig({
  modules: [
    nitroProcessor({ workers: 'server/workers' }),
  ],
})
```

Optional Nitro directory options (see [Nitro configuration](https://nitro.build/docs/configuration)):

```ts
import { defineConfig } from 'nitro/config'
import nitroProcessor from 'nitro-processor'

export default defineConfig({
  serverDir: 'server',
  buildDir: 'node_modules/.nitro', // Nitro v3 default
  modules: [
    nitroProcessor({ workers: 'server/workers' }),
  ],
})
```

## Vite + Nitro (`vite.config.ts`)

When Nitro is embedded in a Vite app, add the [Nitro Vite plugin](https://nitro.build/docs/configuration) and register the module under the `nitro` key:

```ts
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import nitroProcessor from 'nitro-processor'

export default defineConfig({
  plugins: [nitro()],
  nitro: {
    modules: [
      nitroProcessor({ workers: 'server/workers' }),
    ],
  },
})
```

Custom `buildDir` in Vite:

```ts
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import nitroProcessor from 'nitro-processor'

export default defineConfig({
  plugins: [nitro()],
  nitro: {
    buildDir: '.nitro',
    modules: [
      nitroProcessor({ workers: 'server/workers' }),
    ],
  },
})
```

### Separate `nitro.config.ts` with Vite

You can also keep Nitro options in a dedicated config file. Vite picks it up when using the Nitro plugin:

```ts
// nitro.config.ts
import { defineConfig } from 'nitro/config'
import nitroProcessor from 'nitro-processor'

export default defineConfig({
  serverDir: './server',
  modules: [
    nitroProcessor({ workers: 'server/workers' }),
  ],
})
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [nitro()],
})
```

## `buildDir` and the workers CLI

The module emits a dev workers entry at:

`{buildDir}/dev/workers/index.mjs`

| `buildDir` | Dev workers entry |
| --- | --- |
| `node_modules/.nitro` (Nitro v3 default) | `node_modules/.nitro/dev/workers/index.mjs` |
| `.nitro` (custom) | `.nitro/dev/workers/index.mjs` |

Production workers are always emitted to `.output/server/workers/index.mjs` after `nitro build`.

If you change `buildDir` in `nitro.config.ts` or `vite.config.ts`, pass the same path to the workers CLI:

```bash
npx nitro-processor dev --buildDir .nitro
```

Or set the env var:

```bash
NITRO_PROCESSOR_BUILD_DIR=.nitro npx nitro-processor dev
```

Without `--buildDir` or `NITRO_PROCESSOR_BUILD_DIR`, the CLI probes `node_modules/.nitro` and `.nitro`, then uses whichever `dev/workers/index.mjs` has the newest mtime.

## Dev workflow

```bash
# Terminal 1 — app
nitro dev   # standalone Nitro
# or
vite dev    # Vite + Nitro plugin

# Terminal 2 — workers
npx nitro-processor dev
```

Start the app first so the dev workers entry exists. The CLI exits with guidance if `index.mjs` is missing.

See [Getting Started](/getting-started) for queues, workers, Redis, and production commands.
