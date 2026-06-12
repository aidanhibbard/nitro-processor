---
title: Redis configuration
---

# Redis configuration

Queues and workers connect via `useRuntimeConfig().redis` in `resolveConnection()`. Use **`REDIS_*` during dev/build** and **`NITRO_REDIS_*` at runtime** (when running the built server).

Nitro applies env overrides at runtime for variables that match declared `runtimeConfig` keys and use the `NITRO_` prefix. After `nitro build`, inject runtime variables in the host environment (Docker `environment:`, Kubernetes secrets, etc.).

Using Valkey? Read [this thread](https://github.com/taskforcesh/bullmq/issues/3083).

## Environment variables

| Runtime config key | Build / dev (`nitro dev`, `nitro build`) | Runtime (production server) |
| --- | --- | --- |
| `redis.url` | `REDIS_URL` | `NITRO_REDIS_URL` |
| `redis.host` | `REDIS_HOST` | `NITRO_REDIS_HOST` |
| `redis.port` | `REDIS_PORT` | `NITRO_REDIS_PORT` |
| `redis.password` | `REDIS_PASSWORD` | `NITRO_REDIS_PASSWORD` |
| `redis.db` | `REDIS_DB` | `NITRO_REDIS_DB` |
| `redis.username` | `REDIS_USERNAME` | `NITRO_REDIS_USERNAME` |
| `redis.lazyConnect` | `REDIS_LAZY_CONNECT` (`true` / omitted) | `NITRO_REDIS_LAZY_CONNECT` |
| `redis.connectTimeout` | `REDIS_CONNECT_TIMEOUT` (ms) | `NITRO_REDIS_CONNECT_TIMEOUT` |

### `REDIS_*` — build and dev

Read when the module runs (during `nitro dev` or `nitro build`):

```ini
REDIS_URL=redis://127.0.0.1:6379/0
REDIS_USERNAME=myuser
REDIS_LAZY_CONNECT=true
REDIS_CONNECT_TIMEOUT=10000
```

Values are merged into `runtimeConfig.redis` and baked into the Nitro output. They apply at runtime **unless** overridden by `NITRO_REDIS_*`.

### `NITRO_REDIS_*` — runtime only

Use for **production and Docker**: env vars you inject when the container (or process) starts, not when the image is built.

```bash
NITRO_REDIS_URL=redis://redis:6379/0 node .output/server/index.mjs
NITRO_REDIS_URL=redis://redis:6379/0 node .output/server/workers/index.mjs
```

**Docker Compose** — set `NITRO_REDIS_*` on **both** the app service and the workers service (same values):

```yaml
services:
  app:
    environment:
      NITRO_REDIS_URL: redis://redis:6379/0
  workers:
    environment:
      NITRO_REDIS_URL: redis://redis:6379/0
```
