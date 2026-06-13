import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { resolve } from 'pathe'
import { describe, expect, it } from 'vitest'

import { resolvePublishedRuntimeEntryPath } from '../../src/utils/resolve-published-runtime-entry-path'

describe('resolvePublishedRuntimeEntryPath', () => {
  it('prefers dist runtime entry when present', () => {
    const packageRoot = resolve('dist/..')
    const path = resolvePublishedRuntimeEntryPath(packageRoot)

    expect(path).toContain('dist/runtime-entry.mjs')
  })

  it('falls back to src runtime entry when dist is missing', () => {
    const packageRoot = mkdtempSync(join(tmpdir(), 'nitro-processor-entry-path-'))
    try {
      const path = resolvePublishedRuntimeEntryPath(packageRoot)

      expect(path).toBe(resolve(packageRoot, 'src/runtime-entry.ts'))
    } finally {
      rmSync(packageRoot, { recursive: true, force: true })
    }
  })
})
