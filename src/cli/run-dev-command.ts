import { spawn } from 'node:child_process'
import { resolve } from 'pathe'

import { ensureProcessorDevScript } from '../utils/ensure-processor-dev-script'
import { logger } from '../utils/logger'
import type { RunDevCommandArgs } from '../interfaces/run-dev-command-args'
import { resolveDevWorkersPath } from '../utils/resolve-dev-workers-path'

export const runDevCommand = async (args: RunDevCommandArgs): Promise<void> => {
  const dirArg = typeof args.dir === 'string' ? args.dir : '.'
  const projectRoot = resolve(dirArg)
  const envBuildDir = process.env['NITRO_PROCESSOR_BUILD_DIR']
  const buildDir = args.buildDir ?? envBuildDir
  const explicit =
    Boolean(args.buildDir) || (!args.buildDir && Boolean(envBuildDir))

  const resolved = resolveDevWorkersPath(projectRoot, {
    ...(buildDir ? { buildDir } : {}),
    explicit,
  })

  const scriptEnsured = await ensureProcessorDevScript(projectRoot)

  if (!resolved.found) {
    logger.error(`No workers entry at ${resolved.indexFile}.`)
    logger.info(`Tried: ${resolved.tried.join(', ')}`)
    logger.info('Start your dev server first (nitro dev or vite dev).')
    logger.info(
      'Custom buildDir? pass --buildDir <path> (nitro.buildDir in nitro.config.ts or vite.config.ts).',
    )
    logger.info('Monorepo? npx nitro-processor dev <app-directory>')
    process.exit(1)
  }

  if (!scriptEnsured) {
    logger.info(
      'No "processor:dev" script in package.json — continuing with `npx nitro-processor dev`.',
    )
  }

  if (args.verbose) {
    logger.info(
      `Watching ${resolved.watchDir} (buildDir: ${resolved.buildDir})`,
    )
  }

  const nodeBin = process.execPath
  const nodeArgsInput = Array.isArray(args.nodeArgs)
    ? args.nodeArgs
    : typeof args.nodeArgs === 'string'
      ? args.nodeArgs.split(' ')
      : []
  const extraArgs = nodeArgsInput.filter(Boolean)
  const workersValue =
    typeof args.workers === 'string' ? args.workers.trim() : ''
  const workersFlag = workersValue ? `--workers=${workersValue}` : null
  const nodeArgs = [
    ...extraArgs,
    '--watch',
    '--watch-path',
    resolved.watchDir,
    resolved.indexFile,
    ...(workersFlag ? [workersFlag] : []),
  ]

  logger.info('Running watcher for processor')
  const child = spawn(nodeBin, nodeArgs, {
    stdio: 'inherit',
    cwd: projectRoot,
    env: process.env,
  })

  const onSignal = (signal: NodeJS.Signals) => {
    if (!child.killed) {
      child.kill(signal)
    }
  }

  process.on('SIGINT', onSignal)
  process.on('SIGTERM', onSignal)

  child.on('error', (error) => {
    logger.error('Failed to start processor watcher', error)
    process.exit(1)
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}
