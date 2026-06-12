import type { Nitro } from 'nitro/types'

import { resolvePublishedRuntimePath } from '../utils/resolve-published-runtime-path'

export const registerCloseProcessorPlugin = (
  nitro: Nitro,
  packageRoot: string,
): void => {
  const pluginPath = resolvePublishedRuntimePath(
    packageRoot,
    'server/plugins/close-processor.ts',
  )
  nitro.options.plugins.push(pluginPath)
}
