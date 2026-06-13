import type { RedisOptions } from 'bullmq'

declare module 'nitro-processor' {
  export { defineQueue, defineWorker } from './runtime/server/handlers/processor.d.mts'
}

declare module '#processor' {
  export { defineQueue, defineWorker } from './runtime/server/handlers/processor.d.mts'
}

declare module '#processor-utils' {
  export { useProcessor } from './runtime/server/utils/workers.d.mts'
  export type {
    Queue,
    Worker,
    Processor,
    QueueOptions,
    WorkerOptions,
    JobsOptions,
    Job,
    StopAllOptions,
    StopAllResult,
  } from './runtime/server/utils/workers.d.mts'
}

declare module '#bullmq' {
  export * from 'bullmq'
}

declare module 'nitro/types' {
  interface NitroRuntimeConfig {
    redis: RedisOptions & { url?: string }
  }
}
