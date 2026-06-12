import { describe, expect, it } from 'vitest'

import { registerProcessorAliases } from '../../src/setup/register-processor-aliases'
import { resolvePackageRoot } from '../../src/utils/resolve-package-root'

describe('registerProcessorAliases', () => {
  it('initializes alias map when missing', () => {
    const nitro = {
      options: {} as { alias?: Record<string, string> },
      hooks: { hook: () => {} },
    }

    registerProcessorAliases(
      nitro as never,
      resolvePackageRoot(import.meta.url),
    )

    expect(nitro.options.alias).toBeDefined()
  })

  it('registers aliases and rollup plugin for #processor', () => {
    const hooks: Record<string, ((...args: unknown[]) => void)[]> = {}
    const nitro = {
      options: {
        alias: { existing: 'alias-value' } as Record<string, string>,
      },
      hooks: {
        hook: (name: string, fn: (...args: unknown[]) => void) => {
          hooks[name] = hooks[name] ?? []
          hooks[name].push(fn)
        },
      },
    }

    registerProcessorAliases(
      nitro as never,
      resolvePackageRoot(import.meta.url),
    )

    expect(nitro.options.alias['#processor-utils']).toContain('workers')
    expect(nitro.options.alias['nitro-processor']).toContain('processor')
    expect(nitro.options.alias['#bullmq']).toBe('bullmq')

    const rollupHook = hooks['rollup:before']?.[0]
    const config = {
      plugins: [] as {
        resolveId?: (id: string) => string | null
        load?: (id: string) => string | null
      }[],
    }
    rollupHook?.(nitro, config)
    const aliasPlugin = config.plugins[0]
    const virtualId = aliasPlugin?.resolveId?.('#processor')
    expect(virtualId).toBeTruthy()
    const source = aliasPlugin?.load?.(virtualId!)
    expect(source).toContain('defineQueue, defineWorker')
    expect(source).toContain('processor')
    expect(aliasPlugin?.resolveId?.('other-module')).toBeNull()
    expect(aliasPlugin?.load?.('other-module')).toBeNull()
  })

  it('preserves existing #bullmq alias', () => {
    const nitro = {
      options: {
        alias: { '#bullmq': 'custom-bullmq' } as Record<string, string>,
      },
      hooks: {
        hook: () => {},
      },
    }

    registerProcessorAliases(
      nitro as never,
      resolvePackageRoot(import.meta.url),
    )

    expect(nitro.options.alias['#bullmq']).toBe('custom-bullmq')
  })
})
