import { describe, expect, it } from 'vitest'

import { createSetup } from '../../src/setup/create-setup'
import { resolveModuleOptions } from '../../src/utils/resolve-module-options'

describe('createSetup', () => {
  it('composes all module registrars', () => {
    const setup = createSetup(resolveModuleOptions())
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

    setup(nitro as never)

    expect(nitro.options.runtimeConfig.redis).toBeDefined()
    expect(nitro.options.alias['#processor-utils']).toBeTruthy()
    expect(nitro.options.plugins).toHaveLength(1)
    expect(hooks['rollup:before']).toHaveLength(2)
    expect(hooks['types:extend']).toHaveLength(1)
  })
})
