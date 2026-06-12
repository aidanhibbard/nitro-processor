import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  useProcessor,
  type Processor,
} from '../../../src/runtime/server/utils/workers'

const useRuntimeConfig = vi.fn()

const { mockConsolaError, mockConsolaWarn } = vi.hoisted(() => ({
  mockConsolaError: vi.fn(),
  mockConsolaWarn: vi.fn(),
}))

vi.mock('consola', () => ({
  consola: {
    create: () => ({
      withTag: () => ({
        error: mockConsolaError,
        warn: mockConsolaWarn,
      }),
    }),
  },
}))

vi.mock('nitro/runtime-config', () => ({
  useRuntimeConfig: () => useRuntimeConfig(),
}))

vi.mock('bullmq', () => {
  class MockQueue {
    name: string
    opts: WorkerOptions
    constructor(name: string, opts: WorkerOptions) {
      this.name = name
      this.opts = opts
    }

    on = vi.fn()
    close = vi.fn().mockResolvedValue(undefined)
  }

  class MockWorker {
    name: string
    processor: Processor
    opts: WorkerOptions
    constructor(name: string, processor: Processor, opts: WorkerOptions) {
      this.name = name
      this.processor = processor
      this.opts = opts
    }

    run = vi.fn().mockResolvedValue(undefined)
    on = vi.fn()
    close = vi.fn().mockResolvedValue(undefined)
  }

  return { Queue: MockQueue, Worker: MockWorker }
})

describe('useProcessor registry', () => {
  beforeEach(async () => {
    mockConsolaError.mockClear()
    mockConsolaWarn.mockClear()
    useRuntimeConfig.mockReturnValue({
      redis: { host: '127.0.0.1', port: 6379 },
    })
    await useProcessor().stopAll()
  })

  it('strips empty redis values from the connection object', async () => {
    useRuntimeConfig.mockReturnValue({
      redis: { host: '', port: 'not-a-number', password: 'secret' },
    })
    const api = useProcessor()
    const queue = api.createQueue('strip-empty-q')
    expect(queue.opts.connection).toEqual({
      password: 'secret',
      enableOfflineQueue: false,
    })
    await api.stopAll()
  })

  it('creates connections without redis runtime config', async () => {
    useRuntimeConfig.mockReturnValue({})
    const api = useProcessor()
    const queue = api.createQueue('no-redis-q')
    expect(queue.opts.connection).toEqual({ enableOfflineQueue: false })
    await api.stopAll()
  })

  it('exposes live queue and worker registries', async () => {
    const api = useProcessor()
    api.createQueue('live-q')
    api.createWorker('live-q', async () => {})
    expect(api.queues).toHaveLength(1)
    expect(api.workers).toHaveLength(1)
    await api.stopAll()
  })

  it('reuses an existing queue when the same name is registered again', async () => {
    const api = useProcessor()
    const first = api.createQueue('dup-q')
    const second = api.createQueue('dup-q')

    expect(second).toBe(first)
    expect(api.queues).toHaveLength(1)

    await api.stopAll()
  })

  it('reuses an existing worker when the same name is registered again', async () => {
    const api = useProcessor()
    const first = api.createWorker('dup-w', async () => {})
    const second = api.createWorker('dup-w', async () => {})

    expect(second).toBe(first)
    expect(api.workers).toHaveLength(1)

    await api.stopAll()
  })

  it('reuses processor registry state across useProcessor calls', async () => {
    const api1 = useProcessor()
    api1.createQueue('reuse-q')
    const api2 = useProcessor()
    expect(api2.queues).toHaveLength(1)
    await api2.stopAll()
  })

  it('sets maxRetriesPerRequest null only on worker connections', async () => {
    const api = useProcessor()
    const queue = api.createQueue('worker-branch-q')
    const worker = api.createWorker('worker-branch-q', async () => {})
    expect(
      (queue.opts.connection as { maxRetriesPerRequest?: null })
        .maxRetriesPerRequest,
    ).toBeUndefined()
    expect(
      (worker.opts.connection as { maxRetriesPerRequest?: null })
        .maxRetriesPerRequest,
    ).toBeNull()
    await api.stopAll()
  })

  it('creates queues and workers from runtimeConfig with autorun=false', async () => {
    const api = useProcessor()

    const queue = api.createQueue('test-queue', {
      defaultJobOptions: { attempts: 2 },
    })
    const worker = api.createWorker('test-queue', async () => {}, {
      concurrency: 3,
    })

    expect(queue.name).toBe('test-queue')
    expect(queue.opts.connection).toEqual(
      expect.objectContaining({
        host: '127.0.0.1',
        port: 6379,
        enableOfflineQueue: false,
      }),
    )
    expect(queue.opts.connection).not.toHaveProperty('lazyConnect')
    expect(
      (queue.opts.connection as unknown as { maxRetriesPerRequest?: unknown })
        .maxRetriesPerRequest,
    ).toBeUndefined()
    expect(worker.name).toBe('test-queue')
    expect(worker.opts.connection).toEqual(
      expect.objectContaining({
        host: '127.0.0.1',
        port: 6379,
        maxRetriesPerRequest: null,
      }),
    )
    expect(worker.opts.connection).not.toHaveProperty('enableOfflineQueue')
    expect(worker.opts.connection).not.toHaveProperty('lazyConnect')
    expect(worker.opts.autorun).toBe(false)

    expect(api.queues).toContain(queue)
    expect(api.workers).toContain(worker)

    await api.stopAll()
    expect(queue.close).toHaveBeenCalled()
    expect(worker.close).toHaveBeenCalled()
  })

  it('uses redis.url from runtimeConfig (e.g. NUXT_REDIS_URL at runtime)', async () => {
    useRuntimeConfig.mockReturnValue({
      redis: {
        host: '127.0.0.1',
        port: 6379,
        url: 'redis://user:pass@localhost:6379/0',
      },
    })

    const api = useProcessor()
    const queue = api.createQueue('q1')
    const worker = api.createWorker('q1', async () => {})

    expect(queue.opts.connection).toEqual({
      host: '127.0.0.1',
      port: 6379,
      url: 'redis://user:pass@localhost:6379/0',
      enableOfflineQueue: false,
    })
    expect(worker.opts.connection).toEqual({
      host: '127.0.0.1',
      port: 6379,
      url: 'redis://user:pass@localhost:6379/0',
      maxRetriesPerRequest: null,
    })
  })

  describe('lazyConnect and connectTimeout from runtimeConfig', () => {
    it('passes lazyConnect true to queues and workers when set', async () => {
      useRuntimeConfig.mockReturnValue({
        redis: {
          host: '127.0.0.1',
          port: 6379,
          lazyConnect: true,
        },
      })

      const api = useProcessor()
      const queue = api.createQueue('lazy-true')
      const worker = api.createWorker('lazy-true', async () => {})

      expect(queue.opts.connection).toEqual({
        host: '127.0.0.1',
        port: 6379,
        lazyConnect: true,
        enableOfflineQueue: false,
      })
      expect(worker.opts.connection).toEqual({
        host: '127.0.0.1',
        port: 6379,
        lazyConnect: true,
        maxRetriesPerRequest: null,
      })

      await api.stopAll()
    })

    it('passes lazyConnect false when explicitly set', async () => {
      useRuntimeConfig.mockReturnValue({
        redis: {
          host: 'redis.internal',
          port: 6381,
          lazyConnect: false,
        },
      })

      const api = useProcessor()
      const queue = api.createQueue('lazy-false')
      const worker = api.createWorker('lazy-false', async () => {})

      expect(queue.opts.connection).toMatchObject({ lazyConnect: false })
      expect(worker.opts.connection).toMatchObject({ lazyConnect: false })

      await api.stopAll()
    })

    it('passes connectTimeout to queues and workers when set', async () => {
      useRuntimeConfig.mockReturnValue({
        redis: {
          host: '127.0.0.1',
          port: 6379,
          connectTimeout: 15_000,
        },
      })

      const api = useProcessor()
      const queue = api.createQueue('timeout-queue')
      const worker = api.createWorker('timeout-queue', async () => {})

      expect(queue.opts.connection).toEqual({
        host: '127.0.0.1',
        port: 6379,
        connectTimeout: 15_000,
        enableOfflineQueue: false,
      })
      expect(worker.opts.connection).toEqual({
        host: '127.0.0.1',
        port: 6379,
        connectTimeout: 15_000,
        maxRetriesPerRequest: null,
      })

      await api.stopAll()
    })

    it('passes lazyConnect and connectTimeout together (e.g. from REDIS_* / NUXT_REDIS_*)', async () => {
      useRuntimeConfig.mockReturnValue({
        redis: {
          host: 'redis.internal',
          port: 6381,
          username: 'acl-user',
          lazyConnect: true,
          connectTimeout: 12_000,
        },
      })

      const api = useProcessor()
      const queue = api.createQueue('opts-queue')
      const worker = api.createWorker('opts-queue', async () => {})

      expect(queue.opts.connection).toEqual({
        host: 'redis.internal',
        port: 6381,
        username: 'acl-user',
        lazyConnect: true,
        connectTimeout: 12_000,
        enableOfflineQueue: false,
      })
      expect(worker.opts.connection).toEqual({
        host: 'redis.internal',
        port: 6381,
        username: 'acl-user',
        lazyConnect: true,
        connectTimeout: 12_000,
        maxRetriesPerRequest: null,
      })
      expect(worker.opts.connection).not.toHaveProperty('enableOfflineQueue')

      await api.stopAll()
    })
  })

  it('omits lazyConnect when redis.lazyConnect is empty', async () => {
    useRuntimeConfig.mockReturnValue({
      redis: {
        host: '127.0.0.1',
        port: 6379,
        lazyConnect: '',
      },
    })

    const api = useProcessor()
    const queue = api.createQueue('lazy-default')

    expect(queue.opts.connection).toEqual({
      host: '127.0.0.1',
      port: 6379,
      enableOfflineQueue: false,
    })
    expect(queue.opts.connection).not.toHaveProperty('lazyConnect')

    await api.stopAll()
  })

  it('coerces port and db from string runtimeConfig (e.g. NUXT_REDIS_PORT)', async () => {
    useRuntimeConfig.mockReturnValue({
      redis: {
        host: 'redis.internal',
        port: '6381',
        db: '2',
      },
    })

    const api = useProcessor()
    const queue = api.createQueue('string-port')

    expect(queue.opts.connection).toEqual({
      host: 'redis.internal',
      port: 6381,
      db: 2,
      enableOfflineQueue: false,
    })

    await api.stopAll()
  })

  it('omits lazyConnect when NUXT sets string "false"', async () => {
    useRuntimeConfig.mockReturnValue({
      redis: {
        host: '127.0.0.1',
        port: 6379,
        lazyConnect: 'false',
      },
    })

    const api = useProcessor()
    const queue = api.createQueue('lazy-false-string')

    expect(queue.opts.connection).toEqual({
      host: '127.0.0.1',
      port: 6379,
      lazyConnect: false,
      enableOfflineQueue: false,
    })

    await api.stopAll()
  })

  it('strips empty redis fields so they do not appear on the connection', async () => {
    useRuntimeConfig.mockReturnValue({
      redis: {
        url: '',
        host: '127.0.0.1',
        port: 6379,
        password: '',
        username: '',
        db: '',
        connectTimeout: '',
      },
    })

    const api = useProcessor()
    const queue = api.createQueue('strip-empty')

    expect(queue.opts.connection).toEqual({
      host: '127.0.0.1',
      port: 6379,
      enableOfflineQueue: false,
    })
    expect(queue.opts.connection).not.toHaveProperty('lazyConnect')
    expect(queue.opts.connection).not.toHaveProperty('url')
    expect(queue.opts.connection).not.toHaveProperty('password')
    expect(queue.opts.connection).not.toHaveProperty('username')
    expect(queue.opts.connection).not.toHaveProperty('connectTimeout')

    await api.stopAll()
  })

  it('passes runtimeConfig url and options through for queues and workers', async () => {
    useRuntimeConfig.mockReturnValue({
      redis: { url: 'redis://localhost:6379/0', password: 'secret', db: 1 },
    })

    const api = useProcessor()
    const queue = api.createQueue('q2')
    const worker = api.createWorker('q2', async () => {})

    expect(queue.opts.connection).toEqual(
      expect.objectContaining({
        url: 'redis://localhost:6379/0',
        password: 'secret',
        db: 1,
        enableOfflineQueue: false,
      }),
    )
    expect(
      (queue.opts.connection as unknown as { maxRetriesPerRequest?: unknown })
        .maxRetriesPerRequest,
    ).toBeUndefined()
    expect(worker.opts.connection).toEqual(
      expect.objectContaining({
        url: 'redis://localhost:6379/0',
        password: 'secret',
        db: 1,
        maxRetriesPerRequest: null,
      }),
    )
  })

  it('stopAll clears the shared registry for a fresh init in the same process', async () => {
    const api = useProcessor()
    const queue = api.createQueue('shutdown-q')
    const worker = api.createWorker('shutdown-q', async () => {})

    expect(api.queues).toEqual([queue])
    expect(api.workers).toEqual([worker])

    await api.stopAll()

    expect(api.queues).toEqual([])
    expect(api.workers).toEqual([])

    const api2 = useProcessor()
    const queue2 = api2.createQueue('shutdown-q-2')

    expect(api2.queues).toEqual([queue2])
    expect(api2.workers).toEqual([])
    expect(api2.queues).not.toContain(queue)

    await api2.stopAll()
  })

  it('registry can store heterogeneous generic instances safely', async () => {
    const api = useProcessor()

    const q1 = api.createQueue<'n1'>('n1')
    const q2 = api.createQueue<{ foo: string }, { bar: number }, 'n2'>('n2')
    const w1 = api.createWorker<'n1'>('n1', async () => {})
    const w2 = api.createWorker<{ a: number }, { b: string }, 'n2'>(
      'n2',
      async (job) => ({ b: String(job.data.a) }),
    )

    expect(api.queues).toEqual(expect.arrayContaining([q1, q2]))
    expect(api.workers).toEqual(expect.arrayContaining([w1, w2]))

    await api.stopAll()
  })

  it('sets enableOfflineQueue false on queue connections only', async () => {
    const api = useProcessor()
    const queue = api.createQueue('offline-queue')
    const worker = api.createWorker('offline-queue', async () => {})

    expect(queue.opts.connection).toMatchObject({ enableOfflineQueue: false })
    expect(worker.opts.connection).not.toHaveProperty('enableOfflineQueue')

    await api.stopAll()
  })

  it('attaches queue error handler on createQueue', async () => {
    const api = useProcessor()
    const queue = api.createQueue('error-handler-q')

    expect(queue.on).toHaveBeenCalledWith('error', expect.any(Function))
    const handler = vi
      .mocked(queue.on)
      .mock.calls.find(([event]) => event === 'error')?.[1] as (
      error: Error,
    ) => void
    const queueError = new Error('queue boom')
    handler(queueError)
    expect(mockConsolaError).toHaveBeenCalledWith('Queue error', queueError)

    await api.stopAll()
  })

  it('attaches worker error handler on createWorker', async () => {
    const api = useProcessor()
    const worker = api.createWorker('error-handler-w', async () => {})

    expect(worker.on).toHaveBeenCalledWith('error', expect.any(Function))
    const handler = vi
      .mocked(worker.on)
      .mock.calls.find(([event]) => event === 'error')?.[1] as (
      error: Error,
    ) => void
    const workerError = new Error('worker boom')
    handler(workerError)
    expect(mockConsolaError).toHaveBeenCalledWith('Worker error', workerError)

    await api.stopAll()
  })

  it('stopAll logs and returns errors when close fails', async () => {
    const api = useProcessor()
    const queue = api.createQueue('fail-q')
    const worker = api.createWorker('fail-q', async () => {})
    const closeError = new Error('close failed')
    vi.mocked(worker.close).mockRejectedValueOnce(closeError)

    const result = await api.stopAll()

    expect(result).toEqual({ ok: false, errors: [closeError] })
    expect(mockConsolaError).toHaveBeenCalledWith(
      'Failed to close worker',
      closeError,
    )
    expect(queue.close).toHaveBeenCalled()
    expect(api.queues).toEqual([])
    expect(api.workers).toEqual([])
  })

  it('stopAll wraps non-Error close failures', async () => {
    const api = useProcessor()
    const worker = api.createWorker('fail-string-q', async () => {})
    vi.mocked(worker.close).mockRejectedValueOnce('close failed string')

    const result = await api.stopAll()

    expect(result.ok).toBe(false)
    expect(result.errors[0]?.message).toBe('close failed string')
    expect(mockConsolaError).toHaveBeenCalledWith(
      'Failed to close worker',
      result.errors[0],
    )
  })

  it('stopAll logs queue close failures', async () => {
    const api = useProcessor()
    const queue = api.createQueue('fail-queue-close')
    vi.mocked(queue.close).mockRejectedValueOnce(
      new Error('queue close failed'),
    )

    const result = await api.stopAll()

    expect(result.ok).toBe(false)
    expect(mockConsolaError).toHaveBeenCalledWith(
      'Failed to close queue',
      result.errors[0],
    )
  })

  it('stopAll({ force: true }) passes force to worker.close', async () => {
    const api = useProcessor()
    const worker = api.createWorker('force-q', async () => {})

    await api.stopAll({ force: true })

    expect(worker.close).toHaveBeenCalledWith(true)
  })

  it('stopAll({ timeoutMs }) forces worker close after the timeout', async () => {
    vi.useFakeTimers()
    const api = useProcessor()
    const worker = api.createWorker('timeout-w', async () => {})
    vi.mocked(worker.close).mockImplementation((force?: boolean) => {
      if (force) {
        return Promise.resolve()
      }
      return new Promise(() => {})
    })

    const stopPromise = api.stopAll({ timeoutMs: 10 })
    await vi.advanceTimersByTimeAsync(10)
    const result = await stopPromise

    expect(worker.close).toHaveBeenCalledWith(false)
    expect(worker.close).toHaveBeenCalledWith(true)
    expect(mockConsolaWarn).toHaveBeenCalledWith(
      'Graceful worker shutdown timed out after 10ms, forcing stop',
    )
    expect(result.ok).toBe(true)
    vi.useRealTimers()
  })

  it('stopAll reuses an in-flight shutdown promise', async () => {
    vi.useFakeTimers()
    const api = useProcessor()
    const worker = api.createWorker('mutex-w', async () => {})
    vi.mocked(worker.close).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 20)
        }),
    )

    const first = api.stopAll()
    const second = api.stopAll()
    await vi.advanceTimersByTimeAsync(20)
    await Promise.all([first, second])

    expect(worker.close).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('stopAll({ timeoutMs }) finishes gracefully before forcing stop', async () => {
    const api = useProcessor()
    const worker = api.createWorker('graceful-timeout-w', async () => {})

    const result = await api.stopAll({ timeoutMs: 5000 })

    expect(worker.close).toHaveBeenCalledWith(false)
    expect(worker.close).not.toHaveBeenCalledWith(true)
    expect(mockConsolaWarn).not.toHaveBeenCalled()
    expect(result.ok).toBe(true)
  })
})
