import { existsSync } from 'node:fs'
import { resolve } from 'pathe'

export const resolvePublishedRuntimeEntryPath = (
  packageRoot: string,
): string => {
  const distPath = resolve(packageRoot, 'dist/runtime-entry.mjs')
  if (existsSync(distPath)) {
    return distPath
  }
  return resolve(packageRoot, 'src/runtime-entry.ts')
}
