import { describe, expect, it } from 'vitest'

import { registerCloseProcessorPlugin } from '../../src/setup/register-close-processor-plugin'
import { resolvePackageRoot } from '../../src/utils/resolve-package-root'

describe('registerCloseProcessorPlugin', () => {
  it('pushes close-processor plugin path', () => {
    const nitro = {
      options: {
        plugins: [] as string[],
      },
    }

    registerCloseProcessorPlugin(
      nitro as never,
      resolvePackageRoot(import.meta.url),
    )

    expect(nitro.options.plugins).toHaveLength(1)
    expect(nitro.options.plugins[0]).toContain('close-processor')
  })
})
