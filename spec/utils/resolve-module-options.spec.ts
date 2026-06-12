import { describe, expect, it } from 'vitest'

import { resolveModuleOptions } from '../../src/utils/resolve-module-options'

describe('resolveModuleOptions', () => {
  it('applies default workers path', () => {
    expect(resolveModuleOptions()).toEqual({
      workers: 'server/workers',
    })
  })

  it('merges custom workers path with defu', () => {
    expect(resolveModuleOptions({ workers: 'custom/workers' })).toEqual({
      workers: 'custom/workers',
    })
  })
})
