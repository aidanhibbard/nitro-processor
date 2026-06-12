import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { dirname, resolve } from 'pathe'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'

import { resolvePackageRoot } from '../../src/utils/resolve-package-root'

describe('resolvePackageRoot', () => {
  it('resolves to the package root from spec files', () => {
    const packageRoot = resolvePackageRoot(import.meta.url)

    expect(packageRoot).toBe(
      resolve(dirname(fileURLToPath(import.meta.url)), '../..'),
    )
    expect(packageRoot.endsWith('nitro-processor')).toBe(true)
  })

  it('resolves to the package root from bundled dist entrypoints', () => {
    const packageRoot = resolvePackageRoot(import.meta.url)
    const distModuleUrl = pathToFileURL(
      resolve(packageRoot, 'dist/module.mjs'),
    )

    expect(resolvePackageRoot(distModuleUrl)).toBe(packageRoot)
  })

  describe('when no nitro-processor package.json is found', () => {
    let tmpDir: string

    beforeEach(() => {
      tmpDir = mkdtempSync(join(os.tmpdir(), 'resolve-package-root-'))
    })

    afterEach(() => {
      try {
        rmSync(tmpDir, { recursive: true, force: true })
      } catch {
        // ignore
      }
    })

    it('throws when walking past the filesystem root', () => {
      const nestedDir = resolve(tmpDir, 'nested/deep')
      mkdirSync(nestedDir, { recursive: true })
      const fromUrl = pathToFileURL(resolve(nestedDir, 'entry.mjs'))

      expect(() => resolvePackageRoot(fromUrl)).toThrow(
        'nitro-processor package root not found',
      )
    })

    it('skips invalid package.json files while walking upward', () => {
      const nestedDir = resolve(tmpDir, 'nested/deep')
      mkdirSync(nestedDir, { recursive: true })
      writeFileSync(resolve(tmpDir, 'package.json'), 'not json')
      const fromUrl = pathToFileURL(resolve(nestedDir, 'entry.mjs'))

      expect(() => resolvePackageRoot(fromUrl)).toThrow(
        'nitro-processor package root not found',
      )
    })

    it('skips unrelated package.json files while walking upward', () => {
      const nestedDir = resolve(tmpDir, 'nested/deep')
      mkdirSync(nestedDir, { recursive: true })
      writeFileSync(
        resolve(tmpDir, 'package.json'),
        JSON.stringify({ name: 'other-package' }),
      )
      const fromUrl = pathToFileURL(resolve(nestedDir, 'entry.mjs'))

      expect(() => resolvePackageRoot(fromUrl)).toThrow(
        'nitro-processor package root not found',
      )
    })
  })
})
