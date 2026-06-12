import { describe, expect, it } from 'vitest'

import nitroProcessor from '../src/module'

describe('nitroProcessor', () => {
  it('returns a module with the expected name', () => {
    const mod = nitroProcessor()

    expect(mod.name).toBe('nitro-processor')
    expect(typeof mod.setup).toBe('function')
  })

  it('uses default workers path when options are omitted', () => {
    const mod = nitroProcessor()
    const nitro = { options: { runtimeConfig: {} } }

    mod.setup(nitro as never)

    expect(nitro.options.runtimeConfig).toEqual({
      processor: { workers: 'server/workers' },
    })
  })

  it('accepts custom workers path', () => {
    const mod = nitroProcessor({ workers: 'custom/workers' })
    const nitro = { options: { runtimeConfig: {} } }

    mod.setup(nitro as never)

    expect(nitro.options.runtimeConfig).toEqual({
      processor: { workers: 'custom/workers' },
    })
  })
})
