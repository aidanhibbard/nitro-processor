## Unreleased

## v0.1.0

Port runtime and build-time code from nuxt-processor for Nitro v3.

### 🚀 Features

- Runtime helpers: `defineQueue`, `defineWorker`, `useProcessor`, close-on-shutdown plugin.
- Workers rollup plugin emits `{buildDir}/dev/workers/index.mjs` (dev) and `.output/server/workers/index.mjs` (prod).
- Full `nitro-processor dev` CLI with `--buildDir`, `--workers`, `--verbose`, and `NITRO_PROCESSOR_BUILD_DIR` env support.
- Redis runtime config seeding from `REDIS_*` with `NITRO_REDIS_*` overrides at runtime.
- Type augmentations via `types:extend` and shipped `dist/types.d.mts`.

### 🔄 Changes

- Removed v0.0.1 stub `runtimeConfig.processor.workers` seeding; workers path is module option only.

## v0.0.1

Initial repository scaffold.

### 🏗️ Infrastructure

- Nitro module package layout with obuild, strict ESLint/TypeScript, Vitest (100% coverage), VitePress docs, and GitHub CI.
