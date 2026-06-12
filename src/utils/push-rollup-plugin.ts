import type { RollupConfig } from 'nitro/types'
import type { Plugin } from 'rollup'

export const pushRollupPlugin = (
  config: RollupConfig,
  plugin: Plugin,
): void => {
  const current = config.plugins
  if (Array.isArray(current)) {
    config.plugins = [...current, plugin]
  } else if (current) {
    config.plugins = [current, plugin]
  } else {
    config.plugins = [plugin]
  }
}
