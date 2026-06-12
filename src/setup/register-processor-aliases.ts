import type { Plugin } from 'rollup'
import type { Nitro } from 'nitro/types'

import { pushRollupPlugin } from '../utils/push-rollup-plugin'
import { resolvePublishedRuntimePath } from '../utils/resolve-published-runtime-path'

const PROCESSOR_VIRTUAL_ID = '\0nitro-processor#processor'

const createProcessorAliasPlugin = (processorPath: string): Plugin => ({
  name: 'nitro-processor-alias',
  resolveId(id: string) {
    if (id === '#processor') {
      return PROCESSOR_VIRTUAL_ID
    }
    return null
  },
  load(id: string) {
    if (id === PROCESSOR_VIRTUAL_ID) {
      return [
        `export { defineQueue, defineWorker } from ${JSON.stringify(processorPath)}`,
        '',
      ].join('\n')
    }
    return null
  },
})

export const registerProcessorAliases = (
  nitro: Nitro,
  packageRoot: string,
): void => {
  const processorPath = resolvePublishedRuntimePath(
    packageRoot,
    'server/handlers/processor.ts',
  )
  const workersUtilsPath = resolvePublishedRuntimePath(
    packageRoot,
    'server/utils/workers.ts',
  )

  const existingAlias = nitro.options.alias as
    | Record<string, string>
    | undefined
  nitro.options.alias = {
    ...existingAlias,
    '#processor-utils': workersUtilsPath,
    'nitro-processor': processorPath,
    '#bullmq': existingAlias?.['#bullmq'] ?? 'bullmq',
  }

  nitro.hooks.hook('rollup:before', (_nitro, config) => {
    pushRollupPlugin(config, createProcessorAliasPlugin(processorPath))
  })
}
