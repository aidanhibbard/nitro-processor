import { describe, expect, it } from 'vitest'

import { createSetup } from '../../src/setup/create-setup'

describe('createSetup', () => {
  it('seeds processor workers path on nitro runtime config', () => {
    const setup = createSetup({ workers: 'custom/workers' })
    const nitro = {
      options: {
        runtimeConfig: {},
      },
    }

    setup(nitro as never)

    expect(nitro.options.runtimeConfig).toEqual({
      processor: {
        workers: 'custom/workers',
      },
    })
  })

  it('preserves existing runtime config keys', () => {
    const setup = createSetup({ workers: 'server/workers' })
    const nitro = {
      options: {
        runtimeConfig: {
          redis: { url: 'redis://127.0.0.1:6379/0' },
        },
      },
    }

    setup(nitro as never)

    expect(nitro.options.runtimeConfig).toEqual({
      redis: { url: 'redis://127.0.0.1:6379/0' },
      processor: {
        workers: 'server/workers',
      },
    })
  })
})
