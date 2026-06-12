import fg from 'fast-glob'
import { resolve } from 'pathe'

import { logger } from './logger'

export const scanFolder = async (
  rootDir: string,
  path: string,
): Promise<string[]> => {
  const resolvedPath = resolve(rootDir, path)

  const updatedFiles = await fg('**/*.{ts,js,mjs}', {
    cwd: resolvedPath,
    absolute: true,
    onlyFiles: true,
  })

  const files = [...new Set(updatedFiles)]

  if (files.length === 0) {
    logger.warn('No worker files found in project')
  }

  return files
}
