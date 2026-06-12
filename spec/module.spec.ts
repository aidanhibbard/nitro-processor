import { describe, expect, it } from 'vitest'

import nitroProcessor from '../src/module'

describe('nitroProcessor', () => {
  it('returns a module with the expected name', () => {
    const mod = nitroProcessor()

    expect(mod.name).toBe('nitro-processor')
    expect(typeof mod.setup).toBe('function')
  })

  it('registers redis runtime config and aliases on setup', () => {
    const mod = nitroProcessor()
    const hooks: Record<string, ((...args: unknown[]) => void)[]> = {}
    const nitro = {
      options: {
        rootDir: process.cwd(),
        runtimeConfig: {},
        alias: {} as Record<string, string>,
        plugins: [] as string[],
      },
      hooks: {
        hook: (name: string, fn: (...args: unknown[]) => void) => {
          hooks[name] = hooks[name] ?? []
          hooks[name].push(fn)
        },
      },
    }

    mod.setup(nitro as never)

    expect(nitro.options.runtimeConfig.redis).toBeDefined()
    expect(nitro.options.alias['#processor-utils']).toContain(
      'runtime/server/utils/workers',
    )
    expect(nitro.options.plugins.length).toBe(1)
    expect(hooks['rollup:before']?.length).toBeGreaterThan(0)
    expect(hooks['types:extend']?.length).toBeGreaterThan(0)
  })

  it('accepts custom workers path', () => {
    const mod = nitroProcessor({ workers: 'custom/workers' })
    const hooks: Record<string, ((...args: unknown[]) => void)[]> = {}
    const nitro = {
      options: {
        rootDir: process.cwd(),
        runtimeConfig: {},
        alias: {} as Record<string, string>,
        plugins: [] as string[],
      },
      hooks: {
        hook: (name: string, fn: (...args: unknown[]) => void) => {
          hooks[name] = hooks[name] ?? []
          hooks[name].push(fn)
        },
      },
    }

    mod.setup(nitro as never)

    const rollupHook = hooks['rollup:before']?.[0]
    expect(rollupHook).toBeDefined()
    const config = { plugins: [] as unknown[] }
    rollupHook?.(nitro, config)
    expect(config.plugins.length).toBeGreaterThan(0)
  })
})
