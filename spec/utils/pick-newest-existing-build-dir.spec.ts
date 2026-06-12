import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import os from 'node:os'

import { pickNewestExistingBuildDir } from '../../src/utils/pick-newest-existing-build-dir'

describe('pickNewestExistingBuildDir', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(os.tmpdir(), 'pick-newest-build-dir-'))
  })

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore
    }
  })

  const writeEntry = (buildDir: string) => {
    const entryDir = join(tmpDir, buildDir, 'dev', 'workers')
    mkdirSync(entryDir, { recursive: true })
    const indexFile = join(entryDir, 'index.mjs')
    writeFileSync(indexFile, 'export {}\n')
    return indexFile
  }

  it('returns undefined when no candidate exists', () => {
    expect(
      pickNewestExistingBuildDir(tmpDir, ['node_modules/.nitro', '.nitro']),
    ).toBeUndefined()
  })

  it('returns the only existing candidate', () => {
    writeEntry('.nitro')
    expect(
      pickNewestExistingBuildDir(tmpDir, ['node_modules/.nitro', '.nitro']),
    ).toBe('.nitro')
  })

  it('prefers the candidate with the newest mtime', async () => {
    writeEntry('node_modules/.nitro')
    const dotNitroEntry = writeEntry('.nitro')
    const future = new Date(Date.now() + 60_000)
    const { utimesSync } = await import('node:fs')
    utimesSync(dotNitroEntry, future, future)

    expect(
      pickNewestExistingBuildDir(tmpDir, ['node_modules/.nitro', '.nitro']),
    ).toBe('.nitro')
  })
})
