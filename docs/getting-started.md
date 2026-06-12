---
title: Getting Started
---

# Getting Started

::: warning Early development
Runtime helpers and worker entry generation are coming soon. v0.0.1 is a repository scaffold.
:::

## Install

```bash
npm install nitro-processor
```

Add the module in `nitro.config.ts`:

```ts
import { defineConfig } from 'nitro/config'
import nitroProcessor from 'nitro-processor'

export default defineConfig({
  modules: [
    nitroProcessor({ workers: 'server/workers' }),
  ],
})
```

## Redis

Configure Redis with [Nitro runtime config](https://nitro.build/config#runtimeconfig).

- **Dev / build:** `REDIS_*` in `.env` — see [Redis configuration](/redis).
- **Production / Docker:** `NITRO_REDIS_*` at runtime — Nitro applies env overrides with the `NITRO_` prefix.

```ini
# .env (nitro dev / nitro build)
REDIS_URL=redis://127.0.0.1:6379/0
```

```yaml
# Docker — same NITRO_REDIS_* on app and workers services
environment:
  NITRO_REDIS_URL: redis://redis:6379/0
```

Full reference: [Redis configuration](/redis) · [API](/api).

## Define a queue and enqueue from your app

Create `server/queues/index.ts`:

```ts
import { defineQueue } from '#processor'

export default defineQueue({
  name: 'hello',
})
```

## Define a worker

Create `server/workers/index.ts`:

```ts
import { defineWorker } from '#processor'
import type { Job } from '#bullmq'

export default defineWorker({
  name: 'hello',
  async processor(job: Job) {
    console.log('processed', job.name, job.data)
    return job.data
  },
  options: {},
})
```

## Running

- Start your Nitro app normally. This module generates a dedicated workers entry.
- In development, run workers from the Nitro dev workers entry in a separate terminal:

```bash
nitro dev
npx nitro-processor dev
```

By default all workers run. To run only specific workers, use the `--workers=` flag with a comma-separated list of worker names:

```bash
npx nitro-processor dev --workers=basic,hello
```

### CLI

Use the CLI to run workers with file watching and restarts:

```bash
# runs all workers
npx nitro-processor dev

# run only specific workers
npx nitro-processor dev --workers=basic,hello
```

Notes:

- If the dev workers entry does not exist yet, the CLI will ask you to start your Nitro dev server first and exit.
- If your `package.json` does not have a `processor:dev` script, the CLI will offer to add:

```json
{
  "scripts": {
    "processor:dev": "nitro-processor dev"
  }
}
```

Then you can run:

```bash
npm run processor:dev
```

- After building for production, run workers with the same Redis env as your app:

```bash
nitro build
NITRO_REDIS_URL=redis://127.0.0.1:6379/0 node .output/server/workers/index.mjs
```

To run only specific workers in production:

```bash
node .output/server/workers/index.mjs --workers=basic,hello
```

## Durabull

See the dedicated page: [Durabull](/durabull)
