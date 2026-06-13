import type { ModuleOptions } from './interfaces/module-options'
import type { NitroProcessorModule } from './interfaces/nitro-processor-module'
import { createSetup } from './setup/create-setup'
import { resolveModuleOptions } from './utils/resolve-module-options'

export type { ModuleOptions } from './interfaces/module-options'

const nitroProcessor = (options: ModuleOptions = {}): NitroProcessorModule => {
  const resolvedOptions = resolveModuleOptions(options)

  return {
    name: 'nitro-processor',
    setup: createSetup(resolvedOptions),
  }
}

export default nitroProcessor
