import { defineWorker } from '#processor'
import type { Job } from '#bullmq'
import { consola } from 'consola'

const logger = consola.withTag('basic-worker')

export default defineWorker({
  name: 'basic',
  async processor(job: Job) {
    logger.info('processed basic job', job.id)
    return { ok: true, received: job.data }
  },
})
