import { describe, expect, it } from 'vitest'

import { registerProcessorTypes } from '../../src/setup/register-processor-types'
import { resolvePackageRoot } from '../../src/utils/resolve-package-root'

describe('registerProcessorTypes', () => {
  it('extends nitro types with processor paths', () => {
    const hooks: Record<string, ((...args: unknown[]) => void)[]> = {}
    const nitro = {
      options: {},
      hooks: {
        hook: (name: string, fn: (...args: unknown[]) => void) => {
          hooks[name] = hooks[name] ?? []
          hooks[name].push(fn)
        },
      },
    }

    registerProcessorTypes(nitro as never, resolvePackageRoot(import.meta.url))

    const typesHook = hooks['types:extend']?.[0]
    const types = {} as {
      tsConfig?: { compilerOptions?: { paths?: Record<string, string[]> }, include?: string[] }
    }
    typesHook?.(types)

    const paths = types.tsConfig?.compilerOptions?.paths
    expect(paths?.['#processor']).toHaveLength(1)
    expect(paths?.['#processor']?.[0]).toContain('processor')
    expect(paths?.['nitro-processor']?.[0]).toBe(paths?.['#processor']?.[0])
    expect(paths?.['#processor-utils']).toBeDefined()
    expect(paths?.['#bullmq']).toEqual(['bullmq'])
    expect(paths?.['nitro-processor/runtime']?.[0]).toContain('runtime-entry')
    expect(types.tsConfig?.include).toEqual(
      expect.arrayContaining([
        expect.stringContaining('processor'),
        expect.stringContaining('defineQueue'),
        expect.stringContaining('defineWorker'),
      ]),
    )
  })
})
