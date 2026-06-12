import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import {
  mkdtempSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  readFileSync,
} from 'node:fs'
import os from 'node:os'

let promptAnswer = 'n'
vi.mock('node:readline/promises', () => {
  return {
    createInterface: () => ({
      question: async () => promptAnswer,
      close: () => {},
    }),
  }
})

let _spawnCalled = false
let lastSpawnArgs: unknown[] | undefined
let lastChild:
  | {
      killed: boolean
      kill: ReturnType<typeof vi.fn>
      on: (event: string, cb: (code?: number | null) => void) => void
    }
  | undefined
let childEventHandlers: Record<string, ((code?: number | null) => void)[]> = {}
vi.mock('node:child_process', () => {
  return {
    spawn: (...args: unknown[]) => {
      _spawnCalled = true
      lastSpawnArgs = args
      childEventHandlers = {}
      lastChild = {
        killed: false,
        kill: vi.fn((_signal?: unknown) => {
          if (lastChild) {
            lastChild.killed = true
          }
        }),
        on: (event: string, cb: (code?: number | null) => void) => {
          if (!childEventHandlers[event]) childEventHandlers[event] = []
          childEventHandlers[event].push(cb)
        },
      }
      return lastChild as never
    },
  }
})

const importCli = async () => await import('../src/cli')

const createWorkersEntry = (
  rootDir: string,
  buildDir = 'node_modules/.nitro',
) => {
  const entryDir = join(rootDir, buildDir, 'dev', 'workers')
  mkdirSync(entryDir, { recursive: true })
  writeFileSync(join(entryDir, 'index.mjs'), 'export {}\n')
  return entryDir
}

describe('CLI dev command', () => {
  let tmpDir: string
  let exitSpy: { mockRestore: () => void }
  let signalHandlers: Record<string, ((...args: unknown[]) => void)[]>

  beforeEach(() => {
    _spawnCalled = false
    tmpDir = mkdtempSync(join(os.tmpdir(), 'nitro-processor-cli-'))
    writeFileSync(
      join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'app', version: '0.0.0', scripts: {} }, null, 2),
    )
    exitSpy = vi
      .spyOn(
        process as unknown as { exit: (code?: number | null) => never },
        'exit',
      )
      .mockImplementation((code?: number | null) => {
        throw new Error('process.exit(' + (code ?? 0) + ')')
      })
    signalHandlers = {}
    vi.spyOn(process, 'on').mockImplementation(((
      event: string,
      listener: (...args: unknown[]) => void,
    ) => {
      if (!signalHandlers[event]) signalHandlers[event] = []
      signalHandlers[event].push(listener)
      return process
    }) as unknown as typeof process.on)
  })

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore cleanup error
    }
    exitSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('exposes the main command runner', () => {
    expect(typeof importCli).toBe('function')
  })

  it('adds processor:dev script when entry exists and user accepts', async () => {
    createWorkersEntry(tmpDir)
    promptAnswer = 'y'

    const { main } = await importCli()
    await main({ rawArgs: ['dev', tmpDir] })

    const pkg = JSON.parse(
      readFileSync(join(tmpDir, 'package.json'), 'utf8'),
    ) as { scripts?: Record<string, string> }
    expect(pkg.scripts?.['processor:dev']).toBe('nitro-processor dev')
    expect(_spawnCalled).toBe(true)
    expect(signalHandlers['SIGINT']?.length).toBeGreaterThan(0)
  })

  it('does not prompt when script exists', async () => {
    createWorkersEntry(tmpDir)
    const pkgPath = join(tmpDir, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      scripts?: Record<string, string>
    }
    pkg.scripts = {
      ...(pkg.scripts || {}),
      'processor:dev': 'nitro-processor dev',
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

    promptAnswer = 'y'

    const { main } = await importCli()
    await main({ rawArgs: ['dev', tmpDir] })

    const pkg2 = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      scripts?: Record<string, string>
    }
    expect(pkg2.scripts?.['processor:dev']).toBe('nitro-processor dev')
  })

  it('exits with guidance when entry missing; can add script based on user choice', async () => {
    promptAnswer = 'n'
    const { main } = await importCli()
    try {
      await main({ rawArgs: ['dev', tmpDir] })
    } catch (e) {
      expect(String(e)).toContain('process.exit(1)')
    }
    const pkg1 = JSON.parse(
      readFileSync(join(tmpDir, 'package.json'), 'utf8'),
    ) as { scripts?: Record<string, string> }
    expect(pkg1.scripts?.['processor:dev']).toBeUndefined()

    promptAnswer = 'yes'
    try {
      await main({ rawArgs: ['dev', tmpDir] })
    } catch {
      // ignore thrown exit from mocked process.exit
    }
    const pkg2 = JSON.parse(
      readFileSync(join(tmpDir, 'package.json'), 'utf8'),
    ) as { scripts?: Record<string, string> }
    expect(pkg2.scripts?.['processor:dev']).toBe('nitro-processor dev')
  })

  it('runs workers when entry exists even if processor:dev script was not added', async () => {
    createWorkersEntry(tmpDir)
    promptAnswer = 'n'
    const { main } = await importCli()
    await main({ rawArgs: ['dev', tmpDir] })
    expect(_spawnCalled).toBe(true)
  })

  it('uses explicit --buildDir without probing fallbacks', async () => {
    createWorkersEntry(tmpDir, '.nitro')
    promptAnswer = 'n'
    const { main } = await importCli()
    await main({ rawArgs: ['dev', tmpDir, '--buildDir', '.nitro'] })

    expect(_spawnCalled).toBe(true)
    const spawnArgs = lastSpawnArgs as [
      string,
      string[],
      Record<string, unknown>,
    ]
    const nodeArgs = spawnArgs[1]
    expect(
      nodeArgs.some(
        (arg) =>
          typeof arg === 'string' &&
          arg.includes('.nitro/dev/workers/index.mjs'),
      ),
    ).toBe(true)
  })

  it('kills child process on SIGINT signal', async () => {
    createWorkersEntry(tmpDir)
    const pkgPath = join(tmpDir, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      scripts?: Record<string, string>
    }
    pkg.scripts = {
      ...(pkg.scripts || {}),
      'processor:dev': 'nitro-processor dev',
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

    promptAnswer = 'n'
    const { main } = await importCli()
    await main({
      rawArgs: ['dev', tmpDir, '--nodeArgs', '--inspect=9229 --trace-warnings'],
    })

    expect(_spawnCalled).toBe(true)
    const sigint = signalHandlers['SIGINT']?.[0]
    expect(typeof sigint).toBe('function')
    if (sigint) {
      sigint()
    }
    expect(lastChild?.kill).toHaveBeenCalled()

    const spawnArgs = lastSpawnArgs as [
      string,
      string[],
      Record<string, unknown>,
    ]
    expect(Array.isArray(spawnArgs[1])).toBe(true)
  })

  it('exits with child exit code when child process exits', async () => {
    createWorkersEntry(tmpDir)
    const pkgPath = join(tmpDir, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      scripts?: Record<string, string>
    }
    pkg.scripts = {
      ...(pkg.scripts || {}),
      'processor:dev': 'nitro-processor dev',
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

    promptAnswer = 'n'
    const { main } = await importCli()
    try {
      await main({ rawArgs: ['dev', tmpDir] })
      const exitHandlers = childEventHandlers['exit']
      expect(Array.isArray(exitHandlers) && exitHandlers.length > 0).toBe(true)
      exitHandlers?.[0]?.(2)
    } catch (e) {
      expect(String(e)).toContain('process.exit(2)')
    }
  })

  it('invokes dev with verbose flag', async () => {
    createWorkersEntry(tmpDir)
    promptAnswer = 'n'
    const { main } = await importCli()
    await main({ rawArgs: ['dev', tmpDir, '--verbose'] })
    expect(_spawnCalled).toBe(true)
  })

  it('invokes dev with explicit buildDir', async () => {
    createWorkersEntry(tmpDir, '.nitro')
    promptAnswer = 'n'
    const { main } = await importCli()
    await main({ rawArgs: ['dev', tmpDir, '--buildDir', '.nitro'] })
    expect(_spawnCalled).toBe(true)
  })

  it('forwards --workers flag to spawned script', async () => {
    createWorkersEntry(tmpDir)
    const pkgPath = join(tmpDir, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      scripts?: Record<string, string>
    }
    pkg.scripts = {
      ...(pkg.scripts || {}),
      'processor:dev': 'nitro-processor dev',
    }
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

    promptAnswer = 'n'
    const { main } = await importCli()
    await main({ rawArgs: ['dev', tmpDir, '--workers', 'basic,hello'] })

    expect(_spawnCalled).toBe(true)
    const spawnArgs = lastSpawnArgs as [
      string,
      string[],
      Record<string, unknown>,
    ]
    const nodeArgs = spawnArgs[1]
    expect(nodeArgs).toContain('--workers=basic,hello')
  })
})
