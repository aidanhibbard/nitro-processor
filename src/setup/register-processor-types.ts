import type { Nitro, NitroTypes } from 'nitro/types'

import { resolvePublishedRuntimeEntryPath } from '../utils/resolve-published-runtime-entry-path'
import { resolvePublishedRuntimePath } from '../utils/resolve-published-runtime-path'

export const registerProcessorTypes = (
  nitro: Nitro,
  packageRoot: string,
): void => {
  const processorPath = resolvePublishedRuntimePath(
    packageRoot,
    'server/handlers/processor.ts',
  )
  const runtimeEntryPath = resolvePublishedRuntimeEntryPath(packageRoot)
  const defineQueuePath = resolvePublishedRuntimePath(
    packageRoot,
    'server/handlers/defineQueue.ts',
  )
  const defineWorkerPath = resolvePublishedRuntimePath(
    packageRoot,
    'server/handlers/defineWorker.ts',
  )
  const workersUtilsPath = resolvePublishedRuntimePath(
    packageRoot,
    'server/utils/workers.ts',
  )

  nitro.hooks.hook('types:extend', (types: NitroTypes) => {
    types.tsConfig ??= {}
    types.tsConfig.compilerOptions ??= {}
    const paths: Record<string, string[]> = {
      ...(types.tsConfig.compilerOptions.paths as
        | Record<string, string[]>
        | undefined),
      'nitro-processor': [processorPath],
      'nitro-processor/runtime': [runtimeEntryPath],
      '#processor': [processorPath],
      '#processor-utils': [workersUtilsPath],
      '#bullmq': ['bullmq'],
    }
    types.tsConfig.compilerOptions.paths = paths
    types.tsConfig.include ??= []
    types.tsConfig.include.push(
      processorPath,
      defineQueuePath,
      defineWorkerPath,
    )
  })
}
