import { describe, expect, it } from 'vitest'

import { registerRedisRuntimeConfig } from '../../src/setup/register-redis-runtime-config'

describe('registerRedisRuntimeConfig', () => {
  it('seeds redis runtime config keys', () => {
    const nitro = {
      options: {
        runtimeConfig: {},
      },
    }

    registerRedisRuntimeConfig(nitro as never)

    expect(nitro.options.runtimeConfig.redis).toMatchObject({
      url: '',
      host: '',
      port: '',
    })
  })
})
