import { defineWorker } from '#processor'
import type { Job } from '#bullmq'
import { consola } from 'consola'

type HelloName = 'hello'
interface HelloData {
  message: string
  ts: number
}
interface HelloResult {
  echoed: string
  processedAt: number
}

const logger = consola.withTag('hello-worker')

export default defineWorker<HelloName, HelloData, HelloResult>({
  name: 'hello',
  async processor(job: Job<HelloData, HelloResult, HelloName>) {
    const { message, ts } = job.data
    logger.info('processed hello job', job.id)
    return { echoed: message, processedAt: ts }
  },
  options: {},
})
