import type { ModuleOptions } from '../interfaces/module-options'
import type { NitroProcessorModule } from '../interfaces/nitro-processor-module'
import type { Nitro } from 'nitro/types'
import { resolvePackageRoot } from '../utils/resolve-package-root'
import { registerCloseProcessorPlugin } from './register-close-processor-plugin'
import { registerProcessorAliases } from './register-processor-aliases'
import { registerProcessorTypes } from './register-processor-types'
import { registerRedisRuntimeConfig } from './register-redis-runtime-config'
import { registerWorkersRollupPlugin } from './register-workers-rollup-plugin'

const packageRoot = resolvePackageRoot(import.meta.url)

export const createSetup = (
  resolvedOptions: Required<ModuleOptions>,
): NitroProcessorModule['setup'] => {
  return (nitro: Nitro) => {
    registerRedisRuntimeConfig(nitro)
    registerProcessorAliases(nitro, packageRoot)
    registerCloseProcessorPlugin(nitro, packageRoot)
    registerWorkersRollupPlugin(nitro, resolvedOptions)
    registerProcessorTypes(nitro, packageRoot)
  }
}
