import { describe, expect, it, vi } from 'vitest'

import { main } from '../src/cli'
import { logger } from '../src/utils/logger'

describe('cli', () => {
  it('exposes the main command runner', () => {
    expect(typeof main).toBe('function')
  })

  it('logs guidance when dev is invoked', async () => {
    const info = vi.spyOn(logger, 'info').mockImplementation(() => undefined)

    await main({ rawArgs: ['dev'] })

    expect(info).toHaveBeenCalledWith(
      'nitro-processor dev is not implemented yet',
    )
    expect(info).toHaveBeenCalledWith(
      'Start your Nitro dev server first, then run this command again',
    )

    info.mockRestore()
  })
})
