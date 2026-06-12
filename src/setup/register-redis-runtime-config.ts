import type { Nitro } from 'nitro/types'

import { buildRedisRuntimeConfig } from '../utils/redis-runtime-config'

export const registerRedisRuntimeConfig = (nitro: Nitro): void => {
  nitro.options.runtimeConfig['redis'] = buildRedisRuntimeConfig(
    nitro.options.runtimeConfig['redis'] as Record<string, unknown> | undefined,
  )
}
