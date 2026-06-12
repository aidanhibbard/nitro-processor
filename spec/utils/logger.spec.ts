import { describe, expect, it } from 'vitest'

import { name } from '../../package.json'
import { logger } from '../../src/utils/logger'

describe('logger', () => {
  it('is tagged with the package name', () => {
    expect(logger.options.defaults.tag).toBe(name)
  })
})
