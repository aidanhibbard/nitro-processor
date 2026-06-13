import { defineWorker } from '#processor'
import type { Job } from '#bullmq'

export default defineWorker({
  name: 'basic',
  async processor(job: Job) {
    return { ok: true, received: job.data }
  },
})
