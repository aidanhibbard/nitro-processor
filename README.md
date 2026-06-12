# Nitro Processor

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Known Vulnerabilities](https://snyk.io/test/github/aidanhibbard/nitro-processor/badge.svg)](https://snyk.io/test/github/aidanhibbard/nitro-processor)

## Scalable processing for Nitro

Note: This package is under very active development! Please consider creating issues if you run into anything!

**Using an LLM?** Documentation markdown is included in the package at `node_modules/nitro-processor/docs/`

- [✨ &nbsp;Release Notes](./changelog.md)
- [📖 &nbsp;Documentation](https://aidanhibbard.github.io/nitro-processor/)

## Features

- **Dedicated processing**: Workers run in a separate Node process – no coupling to your web server.
- **Scalability**: Run multiple worker processes and instances across machines.
- **Simple DX**: Define queues/workers using first-class helpers.

## Sections

- [Install](#install)
- [Redis configuration](#redis-configuration)
- [Define a queue and enqueue from your app](#define-a-queue-and-enqueue-from-your-app)
- [Define a worker](#define-a-worker)
- [Running](#running)
- [CLI](#cli)
- [Durabull](#durabull)
- [Contribution](#contribution)

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

## Redis configuration

Configure Redis with [Nitro runtime config](https://nitro.build/config#runtimeconfig).

| Phase | Env prefix | Example |
| --- | --- | --- |
| Dev / build | `REDIS_*` | `REDIS_URL=redis://127.0.0.1:6379/0` |
| Runtime (prod/Docker) | `NITRO_REDIS_*` | `NITRO_REDIS_URL=redis://redis:6379/0` |

See [Redis configuration](https://aidanhibbard.github.io/nitro-processor/redis) for the full reference.

## Define a queue and enqueue from your app

```ts
import { defineQueue } from '#processor'

export default defineQueue({
  name: 'hello',
})
```

## Define a worker

```ts
import { defineWorker } from '#processor'
import type { Job } from '#bullmq'

export default defineWorker({
  name: 'hello',
  async processor(job: Job) {
    console.log('processed', job.name, job.data)
    return job.data
  },
})
```

## Running

- Start your Nitro app normally (`nitro dev`). This module generates a dedicated workers entry under `{buildDir}/dev/workers/index.mjs` (default `node_modules/.nitro/dev/workers/index.mjs`).
- In development, run workers from that entry in a separate terminal.

```bash
nitro dev
npx nitro-processor dev
```

Custom `nitro.buildDir`? Pass `--buildDir <path>` to the CLI.

## CLI

```bash
# runs all workers
npx nitro-processor dev

# run only specific workers
npx nitro-processor dev --workers=basic,hello
```

After building for production:

```bash
nitro build
node .output/server/workers/index.mjs
```

## Durabull

See the [Durabull guide](https://aidanhibbard.github.io/nitro-processor/durabull).

## Contribution

See [CONTRIBUTING.md](./CONTRIBUTING.md).

```bash
npm install
npm run dev:prepare
npm run ci
```

[npm-version-src]: https://img.shields.io/npm/v/nitro-processor/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nitro-processor
[npm-downloads-src]: https://img.shields.io/npm/dm/nitro-processor.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nitro-processor
[license-src]: https://img.shields.io/npm/l/nitro-processor.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nitro-processor
