import { describe, expect, it } from 'vitest'

import { registerWorkersRollupPlugin } from '../../src/setup/register-workers-rollup-plugin'
import { resolveModuleOptions } from '../../src/utils/resolve-module-options'

describe('registerWorkersRollupPlugin', () => {
  it('injects workers rollup plugin on rollup:before', () => {
    const hooks: Record<string, ((...args: unknown[]) => void)[]> = {}
    const nitro = {
      options: {
        rootDir: process.cwd(),
      },
      hooks: {
        hook: (name: string, fn: (...args: unknown[]) => void) => {
          hooks[name] = hooks[name] ?? []
          hooks[name].push(fn)
        },
      },
    }

    registerWorkersRollupPlugin(nitro as never, resolveModuleOptions())

    const rollupHook = hooks['rollup:before']?.[0]
    const config = { plugins: [] as unknown[] }
    rollupHook?.(nitro, config)
    expect(config.plugins).toHaveLength(1)
    expect((config.plugins[0] as { name: string }).name).toBe(
      'nitro-processor-emit',
    )
  })
})
