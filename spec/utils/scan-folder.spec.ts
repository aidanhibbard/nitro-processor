import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import os from 'node:os'

import { scanFolder } from '../../src/utils/scan-folder'

describe('scan-folder', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(os.tmpdir(), 'scan-folder-'))
  })

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore cleanup error
    }
  })

  it('warns when no worker files are found', async () => {
    const files = await scanFolder(tmpDir, 'empty-workers')
    expect(files).toEqual([])
  })

  it('finds files in a directory (ts/js/mjs)', async () => {
    const dir = join('some', 'workers')
    const absDir = join(tmpDir, dir)
    mkdirSync(join(absDir, 'nested'), { recursive: true })
    writeFileSync(join(absDir, 'a.ts'), 'export {}')
    writeFileSync(join(absDir, 'b.js'), 'module.exports = {}')
    writeFileSync(join(absDir, 'nested', 'c.mjs'), 'export {}')
    writeFileSync(join(absDir, 'ignored.txt'), 'ignore')

    const files = await scanFolder(tmpDir, dir)
    expect(files.sort()).toEqual(
      [
        join(absDir, 'a.ts'),
        join(absDir, 'b.js'),
        join(absDir, 'nested', 'c.mjs'),
      ].sort(),
    )
  })
})
