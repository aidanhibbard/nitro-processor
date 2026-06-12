import { describe, it, expect } from 'vitest'

import { lazyConnectFromEnv } from '../../src/utils/lazy-connect-from-env'

describe('lazyConnectFromEnv', () => {
  it('maps true/false strings and omits other values', () => {
    expect(lazyConnectFromEnv('true')).toBe(true)
    expect(lazyConnectFromEnv('false')).toBe(false)
    expect(lazyConnectFromEnv('maybe')).toBe('')
    expect(lazyConnectFromEnv(undefined)).toBe('')
  })
})
