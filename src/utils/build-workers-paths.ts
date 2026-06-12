import { resolve } from 'pathe'

import type { BuildWorkersPathsResult } from '../interfaces/build-workers-paths-result'

export const buildWorkersPaths = (
  rootDir: string,
  buildDir: string,
): BuildWorkersPathsResult => {
  const watchDir = resolve(rootDir, buildDir, 'dev/workers')
  const indexFile = resolve(watchDir, 'index.mjs')
  return { watchDir, indexFile }
}
