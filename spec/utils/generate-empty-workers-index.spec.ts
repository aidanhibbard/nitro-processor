import { describe, it, expect } from 'vitest'
import { generateEmptyWorkersIndex } from '../../src/utils/generate-empty-workers-index'

describe('generateEmptyWorkersIndex', () => {
  it('generates a no-op workers entry that exits cleanly', () => {
    const content = generateEmptyWorkersIndex()

    expect(content).toContain('nitro-processor')
    expect(content).toContain('No worker files found')
    expect(content).toContain('process.exit(0)')
  })
})
