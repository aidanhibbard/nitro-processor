## Unreleased

## v0.1.2

TypeScript and consumer DX improvements for virtual aliases and plain `tsc`.

### 🚀 Features

- Public runtime entry: `nitro-processor/runtime` (`defineQueue`, `defineWorker`, `useProcessor`).
- Shipped ambient types for `#processor`, `#processor-utils`, and `#bullmq` via `dist/types.d.mts` and `dist/virtual.d.mts`.
- Shipped `nitro-processor/tsconfig.paths.json` for plain `tsc` / `tsc -b` without Nitro-generated types.
- New package exports: `./runtime`, `./virtual`, `./tsconfig.paths.json`.

### 🩹 Fixes

- Emit runtime `.d.mts` declarations (including `workers.d.mts` for `#processor-utils`).
- Assemble `dist/types.d.mts` on build so published types resolve correctly.
- Include `docs/**/*.md` in the npm tarball.

### 🔄 Changes

- Split development apps into `playground/nitro/` and `playground/vite-nitro/`.
- CI runs playground typechecks, `vite build`, and `nitro-processor dev` smoke test.

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
