import { existsSync } from 'node:fs'

import type { ResolveDevWorkersPathOptions } from '../interfaces/resolve-dev-workers-path-options'
import type { ResolveDevWorkersPathResult } from '../interfaces/resolve-dev-workers-path-result'
import { buildWorkersPaths } from './build-workers-paths'
import { pickNewestExistingBuildDir } from './pick-newest-existing-build-dir'

const PROBE_BUILD_DIRS = ['node_modules/.nitro', '.nitro'] as const
const DEFAULT_BUILD_DIR = PROBE_BUILD_DIRS[0]

export const resolveDevWorkersPath = (
  rootDir: string,
  options: ResolveDevWorkersPathOptions = {},
): ResolveDevWorkersPathResult => {
  const explicit = options.explicit ?? Boolean(options.buildDir)
  const candidates =
    explicit && options.buildDir ? [options.buildDir] : [...PROBE_BUILD_DIRS]

  const tried = candidates.map((buildDir) => {
    const { indexFile } = buildWorkersPaths(rootDir, buildDir)
    return indexFile
  })

  const chosenBuildDir =
    explicit && options.buildDir
      ? options.buildDir
      : (pickNewestExistingBuildDir(rootDir, PROBE_BUILD_DIRS) ??
        DEFAULT_BUILD_DIR)

  const { indexFile, watchDir } = buildWorkersPaths(rootDir, chosenBuildDir)
  const found = existsSync(indexFile)

  return {
    indexFile,
    watchDir,
    buildDir: chosenBuildDir,
    found,
    tried,
    explicit,
  }
}
