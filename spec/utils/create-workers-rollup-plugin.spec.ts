import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import os from 'node:os'

import { createWorkersRollupPlugin } from '../../src/utils/create-workers-rollup-plugin'

describe('createWorkersRollupPlugin', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(os.tmpdir(), 'workers-rollup-'))
  })

  afterEach(() => {
    try {
      rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore
    }
  })

  it('returns a rollup plugin with expected name', () => {
    const plugin = createWorkersRollupPlugin(tmpDir, 'server/workers')
    expect(plugin.name).toBe('nitro-processor-emit')
  })

  it('handles empty worker directories', async () => {
    const plugin = createWorkersRollupPlugin(tmpDir, 'server/workers')
    const emitted: { fileName?: string; source?: string }[] = []
    const context = {
      addWatchFile: () => {},
      emitFile: (file: { type?: string; fileName?: string; source?: string }) => {
        emitted.push(file)
        return 'asset-ref'
      },
      getFileName: () => 'workers/_entry.mjs',
    }

    await plugin.buildStart?.call(context)
    expect(plugin.resolveId?.('\0nitro-processor-entry')).toBe(
      '\0nitro-processor-entry',
    )
    expect(plugin.resolveId?.('other-id')).toBeNull()
    expect(plugin.load?.('\0nitro-processor-entry')).toBe('export {}\n')
    expect(plugin.load?.('other-id')).toBeNull()
    plugin.generateBundle?.call(context)

    const indexAsset = emitted.find(
      (file) => file.fileName === 'workers/index.mjs',
    )
    expect(indexAsset?.source).toContain('No worker files found')
    expect(indexAsset?.source).toContain('process.exit(0)')
  })

  it('emits workers/index.mjs when worker files exist', async () => {
    const workersDir = join(tmpDir, 'server', 'workers')
    mkdirSync(workersDir, { recursive: true })
    writeFileSync(join(workersDir, 'basic.ts'), 'export default {}')

    const plugin = createWorkersRollupPlugin(tmpDir, 'server/workers')
    const emitted: { fileName?: string; source?: string }[] = []
    const context = {
      addWatchFile: () => {},
      emitFile: (file: {
        type: string
        id?: string
        fileName?: string
        source?: string
      }) => {
        if (file.type === 'chunk') {
          return 'chunk-ref'
        }
        emitted.push(file)
        return 'asset-ref'
      },
      getFileName: () => 'workers/_entry.mjs',
    }

    await plugin.buildStart?.call(context)
    plugin.generateBundle?.call({
      ...context,
      getFileName: () => 'workers/_entry.mjs',
    })

    const indexAsset = emitted.find(
      (file) => file.fileName === 'workers/index.mjs',
    )
    expect(indexAsset?.source).toContain('createWorkersApp')
    expect(indexAsset?.source).toContain('nitro-processor')
  })
})
