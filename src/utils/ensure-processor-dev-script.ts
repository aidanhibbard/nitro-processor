import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { resolve } from 'pathe'
import { defu } from 'defu'

import { logger } from './logger'

const PROCESSOR_DEV_SCRIPT = 'nitro-processor dev'

/**
 * Ensures package.json has a "processor:dev" script. If missing, optionally prompts
 * and adds it. Returns true if the script exists (or was added), false otherwise.
 */
export const ensureProcessorDevScript = async (
  projectRoot: string,
  options?: {
    /** Inject for testing; if not provided, uses readline to prompt. */
    ask?: () => Promise<string>
    /** Inject for testing; if not provided, uses writeFileSync. */
    writePkg?: (path: string, data: string) => void
  },
): Promise<boolean> => {
  const pkgPath = resolve(projectRoot, 'package.json')
  if (!existsSync(pkgPath)) {
    return false
  }

  let pkg: { scripts?: Record<string, string> }
  try {
    const pkgRaw = JSON.parse(readFileSync(pkgPath, 'utf8')) as unknown
    pkg = pkgRaw as { scripts?: Record<string, string> }
  } catch (error) {
    logger.error('Failed to parse', error)
    return false
  }

  if (pkg.scripts?.['processor:dev']) {
    return true
  }

  logger.warn('No "processor:dev" script found in package.json.')

  let answer: string
  if (options?.ask) {
    answer = await options.ask()
  } else {
    const rl = createInterface({ input, output })
    try {
      answer = await rl.question('Add script to package.json? (y/N) ')
    } finally {
      rl.close()
    }
  }

  const isYes = typeof answer === 'string' && /^y(?:es)?$/i.test(answer.trim())
  if (!isYes) {
    return false
  }

  const updated = defu(pkg, {
    scripts: {
      'processor:dev': PROCESSOR_DEV_SCRIPT,
    },
  })

  const writePkg =
    options?.writePkg ??
    ((path, data) => {
      writeFileSync(path, data, 'utf8')
    })

  try {
    writePkg(pkgPath, JSON.stringify(updated, null, 2) + '\n')
    logger.success('Added "processor:dev" script to package.json')
    return true
  } catch {
    logger.error('Failed to write to package.json')
    return false
  }
}
