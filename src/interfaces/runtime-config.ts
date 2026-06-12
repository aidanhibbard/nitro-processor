import type { RedisOptions } from 'bullmq'

export interface ProcessorRuntimeConfigRedis extends RedisOptions {
  url?: string
}
