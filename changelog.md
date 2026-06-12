## Unreleased

## v0.1.1

First stable release — Nitro v3 background processing ported from nuxt-processor.

### 🚀 Features

- Runtime helpers: `defineQueue`, `defineWorker`, `useProcessor`, and close-on-shutdown plugin.
- Workers rollup plugin emits `{buildDir}/dev/workers/index.mjs` (dev) and `.output/server/workers/index.mjs` (prod).
- Full `nitro-processor dev` CLI with `--buildDir`, `--workers`, `--nodeArgs`, `--verbose`, and `NITRO_PROCESSOR_BUILD_DIR` env support.
- Redis runtime config seeding from `REDIS_*` with `NITRO_REDIS_*` overrides at runtime.
- Type augmentations via `types:extend` and shipped `dist/types.d.mts`.
- `#processor` barrel exporting both `defineQueue` and `defineWorker` for TypeScript and runtime aliases.
- Configuration guide for standalone Nitro (`nitro.config.ts`) and Vite + Nitro (`vite.config.ts`).
- `assert-baked-redis-empty` script to verify production bundles do not bake Redis credentials.

### 🩹 Fixes

- Resolve package root from published `dist/` entrypoints so module registration works after install.
- Fail worker startup when `waitUntilReady()` rejects; rethrow init errors so the CLI exits non-zero.
- Deduplicate queues and workers by name to avoid leaks on hot reload and duplicate job processing.
- Emit an empty `workers/index.mjs` when the workers folder is cleared so stale entries are not left on disk.
- Handle shutdown timeout inside `stopAll` with an in-flight mutex instead of concurrent `stop()` calls.
- Align `nitro-processor` Nitro alias with the `#processor` barrel (both handlers, not `defineQueue` only).
- Handle child `spawn` `error` events in the dev CLI.

### 🔄 Changes

- Port runtime and build-time code from nuxt-processor for Nitro v3.
- Removed v0.0.1 stub `runtimeConfig.processor.workers` seeding; workers path is a module option only.
- Split build-time utils and interfaces per project conventions (one export per file).

### 📖 Docs

- Added [Configuration](/configuration) guide (`nitro.config.ts`, `vite.config.ts`, `buildDir`, CLI).
- README notes that Nuxt users should use [nuxt-processor](https://github.com/aidanhibbard/nuxt-processor).
- Removed stale “coming soon” notices from API and Redis docs.

## v0.0.1

Initial repository scaffold.

### 🏗️ Infrastructure

- Nitro module package layout with obuild, strict ESLint/TypeScript, Vitest (100% coverage), VitePress docs, and GitHub CI.
