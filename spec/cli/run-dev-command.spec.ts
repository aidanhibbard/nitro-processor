import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import os from 'node:os'

const testRoot = vi.hoisted(() => ({ value: '' }))

vi.mock('pathe', () => ({
  resolve: (...parts: string[]) => {
    if (parts[0] === '.') {
      return testRoot.value
    }
    return parts.join('/')
  },
}))

import { runDevCommand } from '../../src/cli/run-dev-command'
import { logger } from '../../src/utils/logger'

let _spawnCalled = false
let mockChild = {
  killed: false,
  kill: vi.fn(),
  on: vi.fn(),
}
let signalHandlers: Record<string, ((...args: unknown[]) => void)[]> = {}

vi.mock('node:child_process', () => ({
  spawn: () => {
    _spawnCalled = true
    return mockChild
  },
}))

vi.mock('../../src/utils/ensure-processor-dev-script', () => ({
  ensureProcessorDevScript: vi.fn(async () => true),
}))

describe('runDevCommand', () => {
  let tmpDir: string

  beforeEach(() => {
    _spawnCalled = false
    signalHandlers = {}
    mockChild = {
      killed: false,
      kill: vi.fn(),
      on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
        signalHandlers[event] = signalHandlers[event] ?? []
        signalHandlers[event].push(cb)
      }),
    }
    tmpDir = mkdtempSync(join(os.tmpdir(), 'run-dev-command-'))
    testRoot.value = tmpDir
    writeFileSync(
      join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'app', scripts: {} }, null, 2),
    )
    vi.spyOn(process, 'on').mockImplementation(((
      event: string,
      listener: (...args: unknown[]) => void,
    ) => {
      signalHandlers[event] = signalHandlers[event] ?? []
      signalHandlers[event].push(listener)
      return process
    }) as typeof process.on)
  })

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore
    }
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  const createEntry = (buildDir = 'node_modules/.nitro') => {
    const entryDir = join(tmpDir, buildDir, 'dev', 'workers')
    mkdirSync(entryDir, { recursive: true })
    writeFileSync(join(entryDir, 'index.mjs'), 'export {}\n')
  }

  it('spawns without verbose logging by default', async () => {
    createEntry()
    const info = vi.spyOn(logger, 'info').mockImplementation(() => undefined)

    await runDevCommand({ dir: tmpDir })

    expect(info).not.toHaveBeenCalledWith(expect.stringContaining('Watching'))
    info.mockRestore()
    expect(_spawnCalled).toBe(true)
  })

  it('logs verbose watch paths when requested', async () => {
    createEntry()
    const info = vi.spyOn(logger, 'info').mockImplementation(() => undefined)

    await runDevCommand({ dir: tmpDir, verbose: true })

    expect(info).toHaveBeenCalledWith(expect.stringContaining('Watching'))
    info.mockRestore()
    expect(_spawnCalled).toBe(true)
  })

  it('uses NITRO_PROCESSOR_BUILD_DIR when --buildDir is omitted', async () => {
    const entryDir = join(tmpDir, '.custom', 'dev', 'workers')
    mkdirSync(entryDir, { recursive: true })
    writeFileSync(join(entryDir, 'index.mjs'), 'export {}\n')
    vi.stubEnv('NITRO_PROCESSOR_BUILD_DIR', '.custom')

    await runDevCommand({ dir: tmpDir })

    expect(_spawnCalled).toBe(true)
  })

  it('forwards array nodeArgs', async () => {
    createEntry()
    await runDevCommand({ dir: tmpDir, nodeArgs: ['--inspect'] })
    expect(_spawnCalled).toBe(true)
  })

  it('skips kill when child is already killed', async () => {
    createEntry()
    mockChild.killed = true
    await runDevCommand({ dir: tmpDir })
    signalHandlers.SIGTERM?.[0]?.()
    expect(mockChild.kill).not.toHaveBeenCalled()
  })

  it('forwards child exit code', async () => {
    createEntry()
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit')
    })

    await runDevCommand({ dir: tmpDir })
    try {
      signalHandlers.exit?.[0]?.(2)
    } catch (error) {
      expect(String(error)).toContain('process.exit')
    }
    exitSpy.mockRestore()
  })

  it('defaults project dir when dir is not a string', async () => {
    createEntry()
    await runDevCommand({ dir: false as unknown as string })
    expect(_spawnCalled).toBe(true)
  })

  it('logs when processor:dev script is missing', async () => {
    createEntry()
    const { ensureProcessorDevScript } =
      await import('../../src/utils/ensure-processor-dev-script')
    vi.mocked(ensureProcessorDevScript).mockResolvedValueOnce(false)
    const info = vi.spyOn(logger, 'info').mockImplementation(() => undefined)

    await runDevCommand({ dir: tmpDir })

    expect(info).toHaveBeenCalledWith(expect.stringContaining('processor:dev'))
    info.mockRestore()
  })

  it('exits when spawn fails to start the child', async () => {
    createEntry()
    const spawnError = new Error('EMFILE')
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit')
    })

    await runDevCommand({ dir: tmpDir })
    try {
      signalHandlers.error?.[0]?.(spawnError)
    } catch (error) {
      expect(String(error)).toContain('process.exit')
    }

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to start processor watcher',
      spawnError,
    )
    errorSpy.mockRestore()
    exitSpy.mockRestore()
  })

  it('defaults child exit code to 0 when code is null', async () => {
    createEntry()
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((
      code?: number | null,
    ) => {
      throw new Error(`process.exit(${code ?? 0})`)
    }) as typeof process.exit)

    await runDevCommand({ dir: tmpDir })
    try {
      signalHandlers.exit?.[0]?.(null)
    } catch (error) {
      expect(String(error)).toContain('process.exit(0)')
    }
    exitSpy.mockRestore()
  })
})
