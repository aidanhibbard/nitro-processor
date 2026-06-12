import { describe, it, expect } from 'vitest'

import { pushRollupPlugin } from '../../src/utils/push-rollup-plugin'

describe('pushRollupPlugin', () => {
  const plugin = { name: 'test-plugin' }

  it('adds plugin when plugins is undefined', () => {
    const config = {}
    pushRollupPlugin(config, plugin)
    expect(config.plugins).toEqual([plugin])
  })

  it('appends plugin when plugins is an array', () => {
    const existing = { name: 'existing' }
    const config = { plugins: [existing] }
    pushRollupPlugin(config, plugin)
    expect(config.plugins).toEqual([existing, plugin])
  })

  it('wraps plugin when plugins is a single plugin', () => {
    const existing = { name: 'existing' }
    const config = { plugins: existing }
    pushRollupPlugin(config, plugin)
    expect(config.plugins).toEqual([existing, plugin])
  })
})
