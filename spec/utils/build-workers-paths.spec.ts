import { describe, it, expect } from 'vitest'
import { join } from 'node:path'

import { buildWorkersPaths } from '../../src/utils/build-workers-paths'

describe('buildWorkersPaths', () => {
  it('resolves watchDir and indexFile under the build dir', () => {
    const rootDir = '/app'
    const result = buildWorkersPaths(rootDir, 'node_modules/.nitro')

    expect(result.watchDir).toBe(
      join(rootDir, 'node_modules/.nitro/dev/workers'),
    )
    expect(result.indexFile).toBe(
      join(rootDir, 'node_modules/.nitro/dev/workers/index.mjs'),
    )
  })
})
