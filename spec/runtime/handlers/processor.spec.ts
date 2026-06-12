import { describe, it, expect } from 'vitest'

import { defineQueue, defineWorker } from '../../../src/runtime/server/handlers/processor'

describe('processor entry', () => {
  it('re-exports defineQueue and defineWorker', () => {
    expect(defineQueue).toBeTypeOf('function')
    expect(defineWorker).toBeTypeOf('function')
  })
})
