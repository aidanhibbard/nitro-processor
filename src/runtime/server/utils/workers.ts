import type {
  Job,
  JobsOptions,
  QueueOptions,
  WorkerOptions,
  Processor,
  ConnectionOptions,
} from 'bullmq'
import { Queue, Worker } from 'bullmq'
import { consola } from 'consola'
import { useRuntimeConfig } from 'nitro/runtime-config'
import type { StopAllOptions, StopAllResult } from '../types/stop-all'
import { normalizeRedisConnectionEntry } from './normalize-redis-connection'

const logger = consola.create({}).withTag('nitro-processor')

const resolveConnection = (type: 'queue' | 'worker'): ConnectionOptions => {
  const { redis } = useRuntimeConfig()
  const connection: Record<string, unknown> = {}

  if (redis && typeof redis === 'object') {
    for (const [key, value] of Object.entries(
      redis as Record<string, unknown>,
    )) {
      const normalized = normalizeRedisConnectionEntry(key, value)
      if (normalized === undefined) {
        continue
      }
      connection[key] = normalized
    }
  }

  if (type === 'queue') {
    connection['enableOfflineQueue'] = false
  }
  if (type === 'worker') {
    connection['maxRetriesPerRequest'] = null
  }

  return connection
}

interface WorkersRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queues: Queue<any, any, any>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workers: Worker<any, any, any>[]
}

interface ProcessorState {
  registry?: WorkersRegistry
}

/** Nitro may bundle top-level defineQueue() before module-level bindings here; use only globals inside this function. */
const getProcessorState = (): ProcessorState => {
  const key = Symbol.for('nitro-processor.state')
  const g = globalThis as typeof globalThis &
    Record<symbol, ProcessorState | undefined>
  g[key] ??= {}
  return g[key]
}

const getRegistry = (): WorkersRegistry => {
  const state = getProcessorState()
  state.registry ??= {
    queues: [],
    workers: [],
  }
  return state.registry
}

const clearRegistry = (): void => {
  delete getProcessorState().registry
}

let stopAllInFlight: Promise<StopAllResult> | undefined

const collectCloseErrors = (
  results: PromiseSettledResult<void>[],
  kind: 'worker' | 'queue',
  errors: Error[],
): void => {
  for (const result of results) {
    if (result.status === 'rejected') {
      const error =
        result.reason instanceof Error
          ? result.reason
          : new Error(String(result.reason))
      errors.push(error)
      logger.error(`Failed to close ${kind}`, error)
    }
  }
}

interface ProcessorApi {
  createQueue: <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataTypeOrJob = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DefaultResultType = any,
    DefaultNameType extends string = string,
  >(
    name: DefaultNameType,
    options?: Omit<QueueOptions, 'connection'> & {
      defaultJobOptions?: JobsOptions
    },
  ) => Queue<DataTypeOrJob, DefaultResultType, DefaultNameType>
  createWorker: <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataType = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResultType = any,
    NameType extends string = string,
  >(
    name: NameType,
    processor: Processor<DataType, ResultType, NameType>,
    options?: Omit<WorkerOptions, 'connection'>,
  ) => Worker<DataType, ResultType, NameType>
  stopAll: (options?: StopAllOptions) => Promise<StopAllResult>
  readonly queues: WorkersRegistry['queues']
  readonly workers: WorkersRegistry['workers']
}

export const useProcessor = (): ProcessorApi => {
  const createQueue = <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataTypeOrJob = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DefaultResultType = any,
    DefaultNameType extends string = string,
  >(
    name: DefaultNameType,
    options?: Omit<QueueOptions, 'connection'> & {
      defaultJobOptions?: JobsOptions
    },
  ): Queue<DataTypeOrJob, DefaultResultType, DefaultNameType> => {
    const registry = getRegistry()
    const existing = registry.queues.find((queue) => queue.name === name)
    if (existing) {
      return existing as Queue<
        DataTypeOrJob,
        DefaultResultType,
        DefaultNameType
      >
    }

    const queue = new Queue<DataTypeOrJob, DefaultResultType, DefaultNameType>(
      name,
      {
        connection: resolveConnection('queue'),
        ...options,
      },
    )
    queue.on('error', (error: Error) => {
      logger.error('Queue error', error)
    })
    registry.queues.push(queue)
    return queue
  }

  const createWorker = <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataType = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResultType = any,
    NameType extends string = string,
  >(
    name: NameType,
    processor: Processor<DataType, ResultType, NameType>,
    options?: Omit<WorkerOptions, 'connection'>,
  ): Worker<DataType, ResultType, NameType> => {
    const registry = getRegistry()
    const existing = registry.workers.find((worker) => worker.name === name)
    if (existing) {
      return existing as Worker<DataType, ResultType, NameType>
    }

    const worker = new Worker<DataType, ResultType, NameType>(name, processor, {
      connection: resolveConnection('worker'),
      ...options,
      autorun: false,
    })
    worker.on('error', (error: Error) => {
      logger.error('Worker error', error)
    })
    registry.workers.push(worker)
    return worker
  }

  const stopAll = async (options?: StopAllOptions): Promise<StopAllResult> => {
    if (stopAllInFlight) {
      return stopAllInFlight
    }

    stopAllInFlight = (async () => {
      const state = getRegistry()
      let force = options?.force ?? false
      const timeoutMs = options?.timeoutMs
      const errors: Error[] = []

      const closeWorkers = (useForce: boolean) =>
        Promise.allSettled(
          state.workers.map((worker) => worker.close(useForce)),
        )

      let workerResults: PromiseSettledResult<void>[]
      if (timeoutMs && !force) {
        const gracefulClose = closeWorkers(false)
        const outcome = await Promise.race([
          gracefulClose.then((results) => ({ kind: 'done' as const, results })),
          new Promise<{ kind: 'timeout' }>((resolve) => {
            setTimeout(() => {
              resolve({ kind: 'timeout' })
            }, timeoutMs)
          }),
        ])
        if (outcome.kind === 'timeout') {
          logger.warn(
            `Graceful worker shutdown timed out after ${String(timeoutMs)}ms, forcing stop`,
          )
          force = true
          workerResults = await closeWorkers(true)
        } else {
          workerResults = outcome.results
        }
      } else {
        workerResults = await closeWorkers(force)
      }

      collectCloseErrors(workerResults, 'worker', errors)

      const queueResults = await Promise.allSettled(
        state.queues.map((queue) => queue.close()),
      )
      collectCloseErrors(queueResults, 'queue', errors)

      clearRegistry()

      return { ok: errors.length === 0, errors }
    })()

    try {
      return await stopAllInFlight
    } finally {
      stopAllInFlight = undefined
    }
  }

  const api: ProcessorApi = {
    createQueue,
    createWorker,
    stopAll,
    get queues(): WorkersRegistry['queues'] {
      return getRegistry().queues
    },
    get workers(): WorkersRegistry['workers'] {
      return getRegistry().workers
    },
  }
  return api
}

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
}
