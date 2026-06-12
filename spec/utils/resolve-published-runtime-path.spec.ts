import { describe, it, expect } from 'vitest'
import { dirname, resolve } from 'pathe'
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs'

import { resolvePackageRoot } from '../../src/utils/resolve-package-root'
import { resolvePublishedRuntimePath } from '../../src/utils/resolve-published-runtime-path'

describe('resolvePublishedRuntimePath', () => {
  const packageRoot = resolvePackageRoot(import.meta.url)

  it('returns dist .ts path when the transformed typescript file exists', () => {
    const relative = 'server/touch-dist.ts'
    const distFile = resolve(packageRoot, 'dist/runtime', relative)
    mkdirSync(dirname(distFile), { recursive: true })
    writeFileSync(distFile, '')
    try {
      expect(resolvePublishedRuntimePath(packageRoot, relative)).toBe(distFile)
    } finally {
      unlinkSync(distFile)
    }
  })

  it('falls back to src/runtime when dist output is missing', () => {
    const path = resolvePublishedRuntimePath(
      packageRoot,
      'server/missing-runtime-file.ts',
    )
    expect(path).toBe(
      resolve(packageRoot, 'src/runtime/server/missing-runtime-file.ts'),
    )
  })

  it('prefers dist/runtime .mjs when present', () => {
    const relative = 'server/utils/workers.ts'
    const distMjs = resolve(packageRoot, 'dist/runtime', relative).replace(
      /\.ts$/,
      '.mjs',
    )
    mkdirSync(dirname(distMjs), { recursive: true })
    writeFileSync(distMjs, '')
    try {
      const path = resolvePublishedRuntimePath(packageRoot, relative)
      expect(path).toBe(distMjs)
      expect(path.endsWith('server/utils/workers.mjs')).toBe(true)
      expect(path.includes('dist/runtime')).toBe(true)
    } finally {
      unlinkSync(distMjs)
    }
  })
})
