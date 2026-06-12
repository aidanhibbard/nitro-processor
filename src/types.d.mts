import type { RedisOptions } from 'bullmq'

declare module 'nitro-processor' {
  export { defineQueue, defineWorker } from './runtime/server/handlers/processor'
}

declare module '#processor' {
  export { defineQueue, defineWorker } from './runtime/server/handlers/processor'
}

declare module '#bullmq' {
  export * from 'bullmq'
}

declare module 'nitro/types' {
  interface NitroRuntimeConfig {
    redis: RedisOptions & { url?: string }
  }
}
