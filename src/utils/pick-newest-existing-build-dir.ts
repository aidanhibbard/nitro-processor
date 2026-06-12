import { existsSync, statSync } from 'node:fs'

import { buildWorkersPaths } from './build-workers-paths'

export const pickNewestExistingBuildDir = (
  rootDir: string,
  candidates: readonly string[],
): string | undefined => {
  let newest: { buildDir: string; mtimeMs: number } | undefined

  for (const buildDir of candidates) {
    const { indexFile } = buildWorkersPaths(rootDir, buildDir)
    if (!existsSync(indexFile)) {
      continue
    }
    const mtimeMs = statSync(indexFile).mtimeMs
    if (!newest || mtimeMs > newest.mtimeMs) {
      newest = { buildDir, mtimeMs }
    }
  }

  return newest?.buildDir
}
