import { existsSync } from 'node:fs'
import { resolve } from 'pathe'

export const resolvePublishedRuntimePath = (
  packageRoot: string,
  relativePath: string,
): string => {
  const distPath = resolve(packageRoot, 'dist/runtime', relativePath)
  const distPathMjs = distPath.replace(/\.ts$/, '.mjs')
  if (existsSync(distPath)) {
    return distPath
  }
  if (existsSync(distPathMjs)) {
    return distPathMjs
  }
  return resolve(packageRoot, 'src/runtime', relativePath)
}
