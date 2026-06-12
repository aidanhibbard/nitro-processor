import { defu } from 'defu'

import type { ModuleOptions } from '../interfaces/module-options'
import type { NitroProcessorModule } from '../interfaces/nitro-processor-module'
import type { Nitro } from 'nitro/types'

export const createSetup = (
  resolvedOptions: Required<ModuleOptions>,
): NitroProcessorModule['setup'] => {
  return (nitro: Nitro) => {
    nitro.options.runtimeConfig = defu(nitro.options.runtimeConfig, {
      processor: {
        workers: resolvedOptions.workers,
      },
    })
  }
}
