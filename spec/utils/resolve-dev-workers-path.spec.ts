import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import os from 'node:os'

import { resolveDevWorkersPath } from '../../src/utils/resolve-dev-workers-path'

describe('resolveDevWorkersPath', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(os.tmpdir(), 'resolve-dev-workers-'))
  })

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    }
    catch {
      // ignore
    }
  })

  const writeEntry = (buildDir: string) => {
    const entryDir = join(tmpDir, buildDir, 'dev', 'workers')
    mkdirSync(entryDir, { recursive: true })
    writeFileSync(join(entryDir, 'index.mjs'), 'export {}\n')
    return join(entryDir, 'index.mjs')
  }

  it('defaults to node_modules/.nitro probe order', () => {
    const indexFile = writeEntry('node_modules/.nitro')
    const result = resolveDevWorkersPath(tmpDir)

    expect(result.found).toBe(true)
    expect(result.indexFile).toBe(indexFile)
    expect(result.buildDir).toBe('node_modules/.nitro')
    expect(result.tried).toHaveLength(2)
    expect(result.tried[0]).toContain('node_modules/.nitro/dev/workers/index.mjs')
    expect(result.tried[1]).toContain('.nitro/dev/workers/index.mjs')
    expect(result.explicit).toBe(false)
  })

  it('falls back to .nitro when node_modules/.nitro is missing', () => {
    const indexFile = writeEntry('.nitro')
    const result = resolveDevWorkersPath(tmpDir)

    expect(result.found).toBe(true)
    expect(result.indexFile).toBe(indexFile)
    expect(result.buildDir).toBe('.nitro')
  })

  it('returns found=false with default paths when no entry exists', () => {
    const result = resolveDevWorkersPath(tmpDir)
    expect(result.found).toBe(false)
    expect(result.indexFile).toContain('node_modules/.nitro/dev/workers/index.mjs')
  })

  it('uses explicit --buildDir without probing other candidates', () => {
    writeEntry('node_modules/.nitro')
    const result = resolveDevWorkersPath(tmpDir, {
      buildDir: '.custom',
      explicit: true,
    })

    expect(result.found).toBe(false)
    expect(result.buildDir).toBe('.custom')
    expect(result.tried).toHaveLength(1)
    expect(result.explicit).toBe(true)
  })

  it('keeps the first candidate when it has the newest mtime', async () => {
    const firstEntry = writeEntry('node_modules/.nitro')
    writeEntry('.nitro')
    const future = new Date(Date.now() + 120_000)
    const { utimesSync } = await import('node:fs')
    utimesSync(firstEntry, future, future)

    const result = resolveDevWorkersPath(tmpDir)

    expect(result.found).toBe(true)
    expect(result.buildDir).toBe('node_modules/.nitro')
  })

  it('prefers newest mtime when multiple candidates exist', async () => {
    writeEntry('node_modules/.nitro')
    const dotNitroEntry = writeEntry('.nitro')
    const future = new Date(Date.now() + 60_000)
    const { utimesSync } = await import('node:fs')
    utimesSync(dotNitroEntry, future, future)

    const result = resolveDevWorkersPath(tmpDir)

    expect(result.found).toBe(true)
    expect(result.buildDir).toBe('.nitro')
  })
})
