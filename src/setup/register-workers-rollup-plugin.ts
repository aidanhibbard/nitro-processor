import type { Nitro } from 'nitro/types'

import type { ModuleOptions } from '../interfaces/module-options'
import { createWorkersRollupPlugin } from '../utils/create-workers-rollup-plugin'
import { pushRollupPlugin } from '../utils/push-rollup-plugin'

export const registerWorkersRollupPlugin = (
  nitro: Nitro,
  resolvedOptions: Required<ModuleOptions>,
): void => {
  nitro.hooks.hook('rollup:before', (hookNitro, config) => {
    const plugin = createWorkersRollupPlugin(
      hookNitro.options.rootDir,
      resolvedOptions.workers,
    )
    pushRollupPlugin(config, plugin)
  })
}
