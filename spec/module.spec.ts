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

    expect(mod.setup({} as never)).toBeUndefined()
  })

  it('accepts custom workers path', () => {
    const mod = nitroProcessor({ workers: 'custom/workers' })

    expect(mod.setup({} as never)).toBeUndefined()
  })
})
