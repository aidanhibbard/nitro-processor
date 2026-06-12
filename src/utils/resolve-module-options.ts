import { defu } from 'defu'

import type { ModuleOptions } from '../interfaces/module-options'

const defaultModuleOptions: Required<ModuleOptions> = {
  workers: 'server/workers',
}

export const resolveModuleOptions = (
  options: ModuleOptions = {},
): Required<ModuleOptions> => {
  return defu(options, defaultModuleOptions)
}
